import { useState, useEffect } from 'react';
import { FaEdit, FaTrash,FaEye} from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import './index.css';
import img from './assets/462454492340254fb07483122ff40273dfb2a410.jpg';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserDataOpen, setUserDataOpen] = useState(false);
  const [userData,setUserData] = useState(null)
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);


  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditUser(null);
    formik.resetForm();
  };

  const handleOpenedData = ()=>{
    setUserDataOpen(true)
  }
  const handleClosedData = ()=>{
    setUserDataOpen(false)
  }

  const getUserData = async (id) =>{
    setLoadingUser(true);
    handleOpenedData()
    const response = await axios.get(`https://dummyapi.io/data/v1/user/${id}`,{ headers: {
      'Content-Type': 'application/json',
      'app-id': '64fc4a747b1786417e354f31',
     }})
    console.log(response.data);
    setUserData(response.data)
    console.log(userData);
    setLoadingUser(false);
  }

  const fetchData = async () => {
    try {
      const response = await axios.get('https://dummyapi.io/data/v1/user', {
        headers: {
          'app-id': '64fc4a747b1786417e354f31',
        },
        params: {
          limit: 50,
        },
      });
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter(user =>
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, users]);

  const deleteUser = async (id) => {
    try {
      await axios.delete(`https://dummyapi.io/data/v1/user/${id}`, {
        headers: {
          'app-id': '64fc4a747b1786417e354f31',
        },
      });
      toast.success('User deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user: ' + (error.response?.data?.error || error.message));
    }
  };

  const updateUser = async (id, updatedData) => {
    const { email, ...dataToUpdate } = updatedData;
    try {
      await axios.put(`https://dummyapi.io/data/v1/user/${id}`, dataToUpdate, {
        headers: {
          'Content-Type': 'application/json',
          'app-id': '64fc4a747b1786417e354f31',
        },
      });
      toast.success('User updated successfully!');
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user: ' + (error.response?.data?.error || error.message));
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      picture: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First Name is required'),
      lastName: Yup.string().required('Last Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phone: Yup.string().notRequired(),
      picture: Yup.string().url('Must be a valid URL').required('Picture URL is required'),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const response = await axios.post(
          'https://dummyapi.io/data/v1/user/create',
          values,
          {
            headers: {
              'Content-Type': 'application/json',
              'app-id': '64fc4a747b1786417e354f31',
            },
          }
        );
        console.log('User Created Successfully:', response.data);
        toast.success('User created successfully!');
        handleCloseModal();
        fetchData();
        resetForm();
      } catch (error) {
        console.error('Error creating user:', error.response?.data || error.message);
        toast.error('Error: ' + (error.response?.data?.error || error.message));
      }
      setSubmitting(false);
    },
  });

  const handleUpdateClick = (user) => {
    setEditUser(user);
    formik.setValues({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      picture: user.picture,
    });
    setIsOpen(true);
  };

  return (
    <>
      <div className="h-screen bg-cover bg-top flex items-center justify-center" style={{ backgroundImage: `url(${img})` }}>
        <div className="bg-transparent border-white border rounded-2xl p-6 w-full max-w-2xl relative backdrop-blur-md bg-white/30 overflow-y-auto max-h-[80vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-sky-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:mr-2 pr-2">

          {/* Search + Add Button */}
          <div className="flex items-center mb-6">
            <input
              type="text"
              placeholder="Search by Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white p-3 rounded-full outline-none text-gray-800"
            />
            <button
              onClick={handleOpenModal}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full flex items-center"
            >
              <IoMdAdd size={20} />
              <span className="ml-2 hidden sm:inline">Add New Contact</span>
            </button>
          </div>

          {/* Contact List */}
          <div className="space-y-6">
            {filteredUsers.map((user) => (
              <div className="flex items-center justify-between p-4 border-b border-white last:border-b-0" key={user.id}>
                <div className="flex items-center space-x-4">
                  <img
                    src={user.picture}
                    alt={user.firstName + ' ' + user.lastName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-gray-200 text-sm">{user.phone}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={()=>getUserData(user.id)}   className="p-2 bg-sky-500 hover:bg-black text-white rounded-full">
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleUpdateClick(user)}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                  >
                    <FaTrash />
                  </button>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
        

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl relative">
              <form onSubmit={(e) => { e.preventDefault(); editUser ? updateUser(editUser.id, formik.values) : formik.handleSubmit(); }}>
                <div className="flex flex-col items-center mb-8">
                  <img
                    src={formik.values.picture || "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <p className="mt-4 text-gray-600 font-semibold">Enter Photo URL</p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <input
                    type="text"
                    name="firstName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.firstName}
                    placeholder="First Name"
                    className="p-3 rounded-full bg-gray-100 outline-none"
                  />
                  <input
                    type="text"
                    name="lastName"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.lastName}
                    placeholder="Last Name"
                    className="p-3 rounded-full bg-gray-100 outline-none"
                  />
                  {!editUser && (
                    <input
                      type="email"
                      name="email"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      placeholder="Email"
                      className="p-3 rounded-full bg-gray-100 outline-none"
                    />
                  )}
                  <input
                    type="text"
                    name="phone"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                    placeholder="Phone Number"
                    className="p-3 rounded-full bg-gray-100 outline-none"
                  />
                  <input
                    type="text"
                    name="picture"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.picture}
                    placeholder="Picture URL"
                    className="p-3 rounded-full bg-gray-100 outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between">
                  <button
                    className="px-6 py-3 bg-gray-200 rounded-full text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-500 rounded-full text-white font-semibold hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isUserDataOpen &&(
         <div className="fixed bg-black  bg-linear-90 inset-0 flex items-center justify-center z-50">
           
             <div className="mx-auto relative p-6 bg-white rounded-xl shadow-md text-center space-y-4">
             <i onClick={()=>{handleClosedData()}} class="fa-solid fa-xmark absolute right-0 top-0 p-2"></i>
             {loadingUser ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      ) : (
        <>
          <img
            src={userData?.picture}
            alt="Profile"
            className="w-24 h-24 mx-auto rounded-full object-cover mb-4"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100'; }}
          />
          <h2 className="text-xl font-semibold">{userData?.firstName} {userData?.lastName}</h2>
          <p className="text-gray-500 text-sm">ID: {userData?.id}</p>

          <div className="text-left space-y-2 mt-4">
            <p><span className="font-bold">📧 Email:</span> {userData?.email}</p>
            <p><span className="font-bold">📞 Phone:</span> {userData?.phone}</p>
            <p><span className="font-bold">🕒 Registered At:</span> {userData?.registerDate}</p>
            <p><span className="font-bold">🛠 Last Updated:</span> {userData?.updatedDate}</p>
          </div>
        </>
      )}
            </div>
         </div>)}
</div>

      

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;

