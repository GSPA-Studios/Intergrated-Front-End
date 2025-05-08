@classmethod
def get_all_users_by_position(cls):
    """Fetch all users as a list of user documents."""
    return list(user_db.todos_flask.find()) 