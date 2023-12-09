import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthContext } from './Context/AuthContext';
import Home from './Pages/Home';
import Signin from './Pages/Signin';
import Book from './Pages/Book';
import ForgotPassword from './Pages/ForgotPassword';
import MemberDashboard from './Pages/Dashboard/MemberDashboard/MemberDashboard';
import Allbooks from './Pages/Allbooks';
import Header from './Components/Header';
import AdminDashboard from './Pages/Dashboard/AdminDashboard/AdminDashboard';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Header />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/signin"
            element={
              user ? (
                user.isAdmin ? (
                  <Navigate to="/dashboard@admin" />
                ) : (
                  <Navigate to="/dashboard@member" />
                )
              ) : (
                <Signin />
              )
            }
          />
          <Route
            path="/dashboard@member"
            element={
              user ? (
                user.isAdmin === false ? (
                  <MemberDashboard />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard@admin"
            element={
              user ? (
                user.isAdmin === true ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/books" element={<Allbooks />} />
          <Route path="/book/:bookId" element={<Book />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
