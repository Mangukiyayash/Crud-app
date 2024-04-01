import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';

const Crud = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/data');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.name.length < 3) {
      setErrors({ name: 'Name must be 3 or more characters long' });
      return;
    }
    if (!formData.email || !validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    if (!formData.phone || !validatePhone(formData.phone)) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return;
    }
    if (!formData.image) {
      setErrors({ image: 'Please provide the link to an online image' });
      return;
    }

    try {
      if (editingUserId) {
        await axios.put(`http://localhost:3000/data/${editingUserId}`, formData);
        setEditingUserId(null);
      } else {
        await axios.post('http://localhost:3000/data', formData);
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        image: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding/updating data:', error);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d+$/.test(phone);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePagination = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/data/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleEdit = (id) => {
    const userToEdit = data.find(user => user.id === id);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      phone: userToEdit.phone,
      image: userToEdit.image
    });
    setEditingUserId(id);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = data.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ margin: "10px" }}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            placeholder="Name"
          />
          {errors.name && <p className="text-danger">{errors.name}</p>}
        </div>
        <div className="form-group" style={{ margin: "10px" }}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            placeholder="Email"
          />
          {errors.email && <p className="text-danger">{errors.email}</p>}
        </div>
        <div className="form-group" style={{ margin: "10px" }} >
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control"
            placeholder="Phone"
          />
          {errors.phone && <p className="text-danger">{errors.phone}</p>}
        </div>
        <div className="form-group" style={{ margin: "10px" }}>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="form-control"
            placeholder="Image URL"
          />
          {errors.image && <p className="text-danger">{errors.image}</p>}
        </div>
        <button type="submit" className="btn btn-primary">
          {editingUserId ? 'Update' : 'Add'}
        </button>
      </form>
      <input
        type="text"
        className="form-control mt-3"
        placeholder="Search by name/email/phone"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Image</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers
            .filter((user) =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.phone.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: "100px", height: "100px" }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-danger">Delete</button> | 
                  | <button onClick={() => handleEdit(item.id)} className="btn btn-primary ml-2">Edit</button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <div className="mt-3">
        {Array.from({ length: Math.ceil(data.length / usersPerPage) }).map((_, index) => (
          <button key={index} onClick={() => handlePagination(index + 1)} className="btn btn-secondary mr-2">
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Crud;
