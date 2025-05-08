from flask import Flask, request, send_from_directory, session, redirect, url_for, render_template, jsonify
from flask_cors import CORS
from bson import ObjectId, json_util
import json
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import custom modules
from models.user_model import UserModel
from utils.response import make_response
from utils.decorators import login_required, manager_required
from service import image_services
import logging
from utils import google

# Create Flask app (assuming this is imported from utils.app)
from utils import app

# Configure CORS to allow requests from the React frontend
CORS(app, supports_credentials=True, origins=["http://localhost:3000"], allow_headers=["Content-Type", "Authorization"])

# Set the path for serving the React app
REACT_APP_BUILD_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'client/build')

# Image storage directory
IMAGE_STORAGE_DIR = os.environ.get('IMAGE_STORAGE_DIR', "C:/Users/galga/Downloads/ImageStorage/ImageStorage")

# API Routes
@app.route("/api/auth/me")
def api_me():
    if "username" not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    user = UserModel.get_user_by_username(session["username"])
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "username": user.get("username"),
        "position": user.get("position"),
        "date_created": user.get("date_created").isoformat() if user.get("date_created") else None
    })

@app.route("/api/auth/login", methods=["POST"])
def api_login():
    if request.json:
        username = request.json.get("username")
        password = request.json.get("password")
    else:
        username = request.form.get("username")
        password = request.form.get("password")
    
    if UserModel.check_password_credentials(username, password):
        session['username'] = username
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/auth/logout")
def api_logout():
    session.clear()
    return jsonify({"success": True})

@app.route("/api/auth/google")
def api_login_google():
    try:
        redirect_uri = url_for('api_authorize_google', _external=True)
        return google.authorize_redirect(redirect_uri)
    except Exception as e:
        logging.error(f"Error during Google login: {str(e)}")
        return jsonify({"error": "Error during Google login"}), 500

@app.route("/api/auth/google/callback")
def api_authorize_google():
    token = google.authorize_access_token()
    userinfo_endpoint = google.server_metadata['userinfo_endpoint']
    resp = google.get(userinfo_endpoint)
    user_info = resp.json()
    username = user_info["email"]

    user = UserModel.get_user_by_username(username=username)
    if not user:
        # Create new user with member position
        user_model = UserModel(username, "member")
        user_model.save_to_db()
    session['username'] = username
    session['oauth_token'] = token

    return redirect("/admin/dashboard")

@app.route("/api/users", methods=["GET"])
@manager_required
def api_get_users():
    users = UserModel.get_all_users_by_position()
    users_list = []
    
    for user in users:
        users_list.append({
            "id": str(user.get("_id")) if "_id" in user else user.get("username"),
            "username": user.get("username"),
            "position": user.get("position"),
            "date_created": user.get("date_created").isoformat() if user.get("date_created") else None
        })
    
    return jsonify(users_list)

@app.route("/api/users", methods=["POST"])
@manager_required
def api_add_user():
    if request.json:
        username = request.json.get("username")
        position = request.json.get("position")
        password = request.json.get("password", "")  # Optional password
    else:
        username = request.form.get("username")
        position = request.form.get("position")
        password = request.form.get("password", "")  # Optional password
    
    if not username or not position:
        return jsonify({"error": "Username and position are required"}), 400
    
    user = UserModel(username=username, position=position)
    result = user.save_to_db()
    
    # If password is provided, update it
    if password and result != "User already exists":
        user_db = UserModel.get_user_by_username(username)
        if user_db:
            UserModel(username).update_in_db({"password": password})
    
    if result == "User already exists":
        return jsonify({"error": "User already exists"}), 409
    
    return jsonify({"success": True})

@app.route("/api/users/<username>", methods=["DELETE"])
@manager_required
def api_delete_user(username):
    if username == session["username"]:
        return jsonify({"error": "Cannot delete yourself"}), 400
    
    user = UserModel(username)
    if user.delete_from_db():
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Failed to delete user"}), 500

@app.route("/api/fits", methods=["GET"])
@login_required
def api_get_fits():
    fits = image_services.get_all_metadata()
    fits_list = []
    
    for fit in fits:
        # Convert ObjectId to string for JSON serialization
        if "_id" in fit:
            fit["id"] = str(fit["_id"])
            del fit["_id"]
        
        # Add status field
        fit["status"] = "Completed"  # Default status
        
        # Add URL for download
        fit["url"] = f"/api/fits/{fit['id']}/download" if "id" in fit else None
        
        fits_list.append(fit)
    
    return jsonify(fits_list)

@app.route("/api/fits/latest", methods=["GET"])
@login_required
def api_get_latest_fits():
    fits = image_services.get_all_metadata()
    fits_list = []
    
    # Sort by date if available, otherwise use the first 10
    if fits and len(fits) > 0 and "date_of_observation" in fits[0]:
        fits.sort(key=lambda x: x.get("date_of_observation", ""), reverse=True)
    
    for fit in fits[:10]:  # Get latest 10
        # Convert ObjectId to string for JSON serialization
        if "_id" in fit:
            fit["id"] = str(fit["_id"])
            del fit["_id"]
        
        # Add status field
        fit["status"] = "Completed"  # Default status
        
        # Add URL for download
        fit["url"] = f"/api/fits/{fit['id']}/download" if "id" in fit else None
        
        fits_list.append(fit)
    
    return jsonify(fits_list)

@app.route("/api/fits/stats", methods=["GET"])
@login_required
def api_get_fits_stats():
    fits = image_services.get_all_metadata()
    today = datetime.now().date()
    
    # Calculate stats
    total_fits = len(fits)
    todays_uploads = sum(1 for fit in fits if "date_of_observation" in fit and 
                        isinstance(fit["date_of_observation"], str) and
                        datetime.fromisoformat(fit["date_of_observation"]).date() == today)
    pending_fits = 0  # In this example, we don't have pending files
    
    # Count by image types
    light_frames = sum(1 for fit in fits if fit.get("IMAGETYP") == "Light Frame")
    dark_frames = sum(1 for fit in fits if fit.get("IMAGETYP") == "Dark Frame")
    flat_frames = sum(1 for fit in fits if fit.get("IMAGETYP") == "Flat Frame")
    bias_frames = sum(1 for fit in fits if fit.get("IMAGETYP") == "Bias Frame")
    
    return jsonify({
        "totalFits": total_fits,
        "todaysUploads": todays_uploads,
        "pendingFits": pending_fits,
        "lightFrames": light_frames,
        "darkFrames": dark_frames,
        "flatFrames": flat_frames,
        "biasFrames": bias_frames
    })

@app.route("/api/fits/<fit_id>", methods=["GET"])
@login_required
def api_get_fit(fit_id):
    fit = image_services.get_fits_by_id(fit_id)
    
    if not fit:
        return jsonify({"error": "FITS file not found"}), 404
    
    # Convert ObjectId to string for JSON serialization
    if "_id" in fit:
        fit["id"] = str(fit["_id"])
        del fit["_id"]
    
    # Add status field
    fit["status"] = "Completed"  # Default status
    
    # Add URL for download
    fit["url"] = f"/api/fits/{fit_id}/download"
    
    return jsonify(fit)

@app.route("/api/fits/<fit_id>/download")
@login_required
def api_download_fit(fit_id):
    fit = image_services.get_fits_by_id(fit_id)
    
    if not fit or "filename" not in fit:
        return jsonify({"error": "FITS file not found"}), 404
    
    try:
        filename = secure_filename(fit["filename"])
        return send_from_directory(IMAGE_STORAGE_DIR, filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"Error downloading file: {str(e)}"}), 500

@app.route("/api/fits/refresh", methods=["POST"])
@manager_required
def api_refresh_fits():
    try:
        image_services.refresh_data_from_directory(IMAGE_STORAGE_DIR)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": f"Error refreshing FITS data: {str(e)}"}), 500

# Original routes (keep for compatibility)
@app.route("/")
def index():
    return redirect(url_for("home"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if "username" in session:
            return redirect(url_for("home"))

        username = request.form.get("username")
        password = request.form.get("password")

        if UserModel.check_password_credentials(username, password):
            session['username'] = username
            return redirect(url_for("home"))
        else:
            return render_template("error.html", message="Error occurred during login")

    if "username" in session:
        return redirect(url_for("logout"))

    return render_template("login.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

@app.route("/authorized/images", methods=["GET", "POST"])
@manager_required
def authorized1():
    if request.method == "POST":
        image_services.refresh_data_from_directory(IMAGE_STORAGE_DIR)
        return render_template("authorize_images.html", images=image_services.get_all_metadata())

    return render_template("authorize_images.html", images=image_services.get_all_metadata())

@app.route("/authorized/removeuser", methods=["GET", "POST"])
@manager_required
def authorized2():
    users = UserModel.get_all_users_by_position()
    if request.method == 'POST':
        username = request.form.get("username")

        if username == session['username']:
            return render_template("remove_user.html", message="cannot remove yourself", users=users)

        user = UserModel(username)
        if user.delete_from_db():
            users = UserModel.get_all_users_by_position()
            return render_template("remove_user.html", message="Successfully Deleted", users=users)
        else:
            return render_template("remove_user.html", message="Failed to Delete User", users=users)
    
    return render_template("remove_user.html", users=users)

@app.route("/authorized/adduser", methods=["GET", "POST"])
@manager_required
def authorized3():
    if request.method == 'POST':
        username = request.form.get("username")
        position = request.form.get("position")
        password = request.form.get("password", "")  # Optional password

        user = UserModel(username=username, position=position)
        result = user.save_to_db()
        
        # If password provided, update it
        if password and result != "User already exists":
            user_db = UserModel.get_user_by_username(username)
            if user_db:
                UserModel(username).update_in_db({"password": password})

        return render_template("add_user.html", message=result)

    return render_template("add_user.html")

@app.route("/@me", methods=["GET"])
@login_required
def me():
    user = UserModel.get_user_by_username(session["username"])

    if not user:
        return render_template("error.html", message="User does not exist")

    user_info = {
        "username": user.get("username"),
        "position": user.get("position"),
        "date_created": user.get("date_created").strftime("%Y-%m-%d %H:%M:%S") if user.get("date_created") else "N/A"
    }

    return render_template("profile.html", user=user_info)

@app.route('/login/google')
def login_google():
    try:
        redirect_uri = url_for('authorize_google',_external = True)
        return google.authorize_redirect(redirect_uri)
    except Exception as e:
        logging.error(f"Error during logging in:{str(e)}")
        return render_template("error.html", message="Error occurred during login")

@app.route("/authorize/google")
def authorize_google():
    token = google.authorize_access_token()
    userinfo_endpoint = google.server_metadata['userinfo_endpoint']
    resp = google.get(userinfo_endpoint)
    user_info = resp.json()
    username = user_info["email"]

    user = UserModel.get_user_by_username(username=username)
    if not user:
        user_model = UserModel(username, "member")
        user_model.save_to_db()
    session['username'] = username
    session['oauth_token'] = token

    return redirect(url_for('home'))

@app.route("/authorized/<path:filename>")
@login_required
def serve_fts_file(filename):
    safe_filename = secure_filename(filename)

    try:
        return send_from_directory(IMAGE_STORAGE_DIR, safe_filename, as_attachment=False)
    except Exception as e:
        return f"Error loading file: {str(e)}", 404

@app.route("/authorized/view/<path:filename>")
@login_required
def serve_image(filename):
    safe_filename = secure_filename(filename)

    try:
        return send_from_directory(IMAGE_STORAGE_DIR, safe_filename, as_attachment=False)
    except Exception as e:
        return f"Error loading image: {str(e)}", 404

# Serve React App - This should be the last route
@app.route("/admin", defaults={"path": ""})
@app.route("/admin/<path:path>")
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(REACT_APP_BUILD_PATH, path)):
        return send_from_directory(REACT_APP_BUILD_PATH, path)
    else:
        return send_from_directory(REACT_APP_BUILD_PATH, "index.html")

if __name__ == "__main__":
    app.run(debug=True) 