import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Container,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Box,
} from '@mui/material';

import MenuIcon   from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon    from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Toaster, toast } from 'react-hot-toast';
// Theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    background: { default: '#eef6ff', paper: '#fff' },
  },
});

const sortFields = ['exposure_time','date_of_observation','object_name','filter','ra_of_image','dec_of_image','temp_of_detector','julian_date','gain','airmass'];
const sortOrders = ['asc','desc'];

function LoginPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Login (stub)</Typography>
      <Typography>This is a login page stub.</Typography>
    </Container>
  );
}

function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [rows, setRows] = useState([{ op: 'AND', term: '', field: 'object_name' }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [results, setResults] = useState([]);

  const addRow = () => setRows(r => [...r, { op: 'AND', term: '', field: 'object_name' }]);
  const removeRow = () => setRows(r => r.length > 1 ? r.slice(0, -1) : r);
  const updateRow = (idx, key, value) => setRows(r => r.map((row,i) => i===idx ? { ...row, [key]: value } : row));

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    rows.forEach(r => {
      params.append('operator', r.op);
      params.append('field', r.field);
      params.append('term', r.term);
    });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (sortField) params.append('sortField', sortField);
    params.append('sortOrder', sortOrder);
    params.append('page', page);
    params.append('limit', limit);

    try {
      const res = await fetch(`/api/images?${params.toString()}`);
      if (!res.ok) throw Error();
      const { images } = await res.json();
      setResults(images);
      toast.success('Images loaded');
    } catch {
      toast.error('Search failed');
    }
  };

  const handleClear = () => {
    setKeyword('');
    setRows([{ op: 'AND', term: '', field: 'object_name' }]);
    setStartDate('');
    setEndDate('');
    setSortField('');
    setSortOrder('asc');
    setPage(1);
    setLimit(10);
    setResults([]);
  };

  return (
    <>
      <Box sx={{ bgcolor: 'primary.main', color: '#fff', py: 6, textAlign: 'center' }}>
        <Typography variant="h3">MACRO Astronomical Images</Typography>
        <Typography>Search our database by various criteria.</Typography>
      </Box>

      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }} elevation={1}>
          <Typography variant="h5" gutterBottom>Advanced Image Search</Typography>

          {/* Row 1: Keyword full width */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Keyword"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Row 2: Dynamic criteria rows: Operator, Field, Term */}
          {rows.map((r, idx) => (
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }} key={idx}>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Operator</InputLabel>
                  <Select
                    value={r.op}
                    label="Operator"
                    onChange={e => updateRow(idx, 'op', e.target.value)}
                  >
                    <MenuItem value="AND">AND</MenuItem>
                    <MenuItem value="OR">OR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={r.field}
                    label="Field"
                    onChange={e => updateRow(idx, 'field', e.target.value)}
                  >
                    {sortFields.map(f => (
                      <MenuItem key={f} value={f}>{f.replace(/_/g, ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Term"
                  value={r.term}
                  onChange={e => updateRow(idx, 'term', e.target.value)}
                />
              </Grid>
            </Grid>
          ))}
          <Box sx={{ mb: 3 }}>
            <Button startIcon={<AddIcon />} onClick={addRow} sx={{ mr: 2 }}>Add Row</Button>
            <Button startIcon={<RemoveIcon />} onClick={removeRow}>Remove Row</Button>
          </Box>

          {/* Row 3: Date range */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Row 4: Sorting and pagination */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort Field</InputLabel>
                <Select
                  value={sortField}
                  label="Sort Field"
                  onChange={e => setSortField(e.target.value)}
                >
                  {sortFields.map(f => <MenuItem key={f} value={f}>{f.replace(/_/g, ' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  label="Order"
                  onChange={e => setSortOrder(e.target.value)}
                >
                  {sortOrders.map(o => <MenuItem key={o} value={o}>{o.toUpperCase()}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Page"
                value={page}
                onChange={e => setPage(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Limit</InputLabel>
                <Select
                  value={limit}
                  label="Limit"
                  onChange={e => setLimit(Number(e.target.value))}
                >
                  {[10, 20, 50].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'right' }}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch} sx={{ mr: 2 }}>Search</Button>
            <Button onClick={handleClear}>Clear</Button>
          </Box>
        </Paper>

        {/* Results display */}
        <Grid container spacing={3}>
          {results.map(img => (
            <Grid item xs={12} sm={6} md={4} key={img.filename}>
              <Card>
                <CardMedia component="img" height="140" image={img.filepath} alt={img.filename} />
                <CardContent>
                  <Typography variant="subtitle1">{img.filename}</Typography>
                  <Typography variant="body2" color="text.secondary">{img.object_name} — {img.date_of_observation}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Toaster />
      <Router>
        <AppBar position="static" sx={{ background: 'linear-gradient(45deg,#1976d2 30%,#63a4ff 90%)' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}><MenuIcon /></IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Macro Astronomical Data</Typography>
            <Button color="inherit" component={Link} to="/">Search</Button>
            <Button color="inherit" component={Link} to="/login">Login</Button>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<SearchPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
