import React, { useState } from 'react';
import { IoCallSharp } from "react-icons/io5";
import { IoIosMail } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Send, PhoneCall, Mail, MapPin, Sparkles } from 'lucide-react';
import MapLoader from './map-loader';
import { contactAPI } from '../utils/api';
import { showSuccess, showError } from '../utils/swalUtils';

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
      await contactAPI.create(formData);
      showSuccess('Success!', 'Your inquiry has been submitted successfully.');
      setFormData({ name: '', subject: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
      showError('Oops...', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-50/80 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Form Card */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-100 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
                <Sparkles className="w-3.5 h-3.5" />
                We'd love to hear from you
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Get in Touch</h2>
              <p className="text-xs sm:text-sm text-slate-500">Fill out the form below and our support team will get back to you within 24 hours.</p>
            </div>

            <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Product Inquiry"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    maxLength="10"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="How can we help you today?"
                  rows="4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-orange-950 text-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-800 space-y-8 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-white">Contact Information</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Reach out directly via phone, email, or visit our central Kerala office.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone No.</p>
                    <a href="tel:+918606065001" className="text-sm font-bold text-white hover:text-orange-400 transition-colors block mt-0.5">
                      +91 8606065001
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <a href="mailto:admin@kppcs.com" className="text-sm font-bold text-white hover:text-orange-400 transition-colors block mt-0.5">
                      admin@kppcs.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Office Address</p>
                    <p className="text-xs sm:text-sm font-bold text-white mt-0.5 capitalize leading-relaxed">
                      Edavannappara, Malappuram District, Kerala, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Customer Support: Mon - Sat (9am - 6pm)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>

        </div>

        {/* Map Location Section */}
        <div className="mt-12 bg-white p-4 sm:p-6 rounded-3xl shadow-lg border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4 px-2">Office Location</h3>
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <MapLoader
              title="Google Maps Office Location"
              className="w-full h-[350px] sm:h-[450px]"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.175874738364!2d77.70469257578802!3d13.024469613715535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11000bcd07cd%3A0x28024596209046f5!2sKP%20Consulting!5e0!3m2!1sen!2sin!4v1753201530246!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
