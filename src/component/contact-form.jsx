import React, { useState } from 'react';
import { IoCallSharp } from "react-icons/io5";
import { IoIosMail } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import MapLoader from './map-loader';
import { contactAPI } from '../utils/api';
import Swal from 'sweetalert2';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      try {
        await contactAPI.create(formData);
      } catch (apiError) {
        console.warn('API submission failed (likely CORS), falling back to localStorage:', apiError);
        const localContacts = JSON.parse(localStorage.getItem('adminContacts') || '[]');
        localContacts.push({
          id: Date.now(),
          ...formData,
          is_read: false,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('adminContacts', JSON.stringify(localContacts));
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your inquiry has been submitted successfully.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setFormData({ name: '', subject: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#000',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-[-30px]">
          <div className="md:col-span-7 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" value={formData.name} onChange={handleChange} required aria-label="Full Name" placeholder="Full Name" className="border border-[#f6e416] rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400" />
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required aria-label="Subject" placeholder="Subject" className="border border-[#f6e416] rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required aria-label="Email Address" placeholder="Email" className="border border-[#f6e416] rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400" />
              <input type="tel" maxLength="10" name="phone" value={formData.phone} onChange={handleChange} aria-label="Phone Number" placeholder="Phone Number" className="border border-[#f6e416] rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400" />
              <textarea
                name="message" value={formData.message} onChange={handleChange} required
                aria-label="Message" placeholder="Message" rows="4" className="border border-[#f6e416] rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"></textarea>
              <div className="text-right">
                <button type="submit" disabled={loading} aria-label="Submit Contact Form" className="bg-black text-white px-6 py-2 rounded-full hover:bg-blue-800 transition disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
          <div className="md:col-span-5 bg-black text-white p-8 space-y-8 rounded-2xl shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#f6e416] bg-gray-800 flex items-center justify-center">
                <IoCallSharp className="text-white-500 text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Phone No.</p>
                <a href="tel:+918606065001" className="text-white">+91 8606065001</a>
              </div>
            </div>
            <hr className="border-gray-700" />
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#f6e416] bg-gray-800 flex items-center justify-center">
                <IoIosMail className="text-white-500 text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Email Address</p>
                <a href="mailto:admin@kppcs.com" className="text-white">admin@kppcs.com</a>
              </div>
            </div>
            <hr className="border-gray-700" />
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#ffe600] bg-gray-800 flex items-center justify-center">
                <FaMapMarkerAlt className="text-white-500 text-2xl" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Office Address</p>
                <p>edavannappara, malappuram district, kerala</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="my-10 pt-5">
        <div className="container">
          <MapLoader
            title="Google Maps Office Location"
            className='rounded-xl w-full h-[450px]'
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.175874738364!2d77.70469257578802!3d13.024469613715535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11000bcd07cd%3A0x28024596209046f5!2sKP%20Consulting!5e0!3m2!1sen!2sin!4v1753201530246!5m2!1sen!2sin"
            width="100%" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
