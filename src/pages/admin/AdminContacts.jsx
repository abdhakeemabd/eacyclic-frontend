import React, { useState, useEffect } from 'react';
import AdminLayout from '../../component/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mail, MailOpen, Trash2, 
  Phone, User, Calendar, MessageSquare, 
  X, Info, Layers, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { contactAPI } from '../../utils/api';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';
import { useSearchParams } from 'react-router-dom';

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(25);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    setSearchParams(prev => {
      if (currentPage === 1) prev.delete('page');
      else prev.set('page', currentPage);
      return prev;
    }, { replace: true });
  }, [currentPage, setSearchParams]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      let apiContacts = [];
      try {
        const response = await contactAPI.getAll();
        apiContacts = response.data || [];
      } catch (e) {
        console.warn('API fetch failed');
      }
      
      let localContacts = [];
      try {
        localContacts = JSON.parse(localStorage.getItem('adminContacts') || '[]');
      } catch (e) {
        console.warn('Local fetch failed');
      }

      // Merge by ID
      const mergedMap = new Map();
      apiContacts.forEach(c => { if (c.id) mergedMap.set(c.id.toString(), c); });
      localContacts.forEach(c => { if (c.id) mergedMap.set(c.id.toString(), c); });
      const combinedContacts = Array.from(mergedMap.values());
      
      // Sort newest first
      combinedContacts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setContacts(combinedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (contactId) => {
    try {
      await contactAPI.markAsRead(contactId);
    } catch (error) {
      console.warn('Error marking contact as read (likely CORS). Updating localStorage.');
      const localContacts = JSON.parse(localStorage.getItem('adminContacts') || '[]');
      const updated = localContacts.map(c => c.id === contactId ? { ...c, is_read: true } : c);
      localStorage.setItem('adminContacts', JSON.stringify(updated));
    }
    fetchContacts();
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await contactAPI.delete(contactId);
      } catch (error) {
        console.warn('Error deleting contact (likely CORS). Updating localStorage.');
        const localContacts = JSON.parse(localStorage.getItem('adminContacts') || '[]');
        const updated = localContacts.filter(c => c.id !== contactId);
        localStorage.setItem('adminContacts', JSON.stringify(updated));
      }
      fetchContacts();
      if (selectedContact?.id === contactId) {
        setShowModal(false);
      }
    }
  };

  const viewContactDetails = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    if (!contact.is_read) {
      handleMarkAsRead(contact.id);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRead = 
      filterRead === 'all' ||
      (filterRead === 'unread' && !contact.is_read) ||
      (filterRead === 'read' && contact.is_read);
    return matchesSearch && matchesRead;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    return Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
  };

  const tableHeaders = [
    { label: '#' },
    { label: 'Sender Info' },
    { label: 'Subject' },
    { label: 'Date Received' },
    { label: 'Status' },
    { label: 'Actions', className: 'text-center' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 md:px-8 py-6 w-full max-w-[1600px] mx-auto">
        <div className="bg-card text-card-foreground rounded-3xl shadow-md border border-border overflow-hidden">
          
          <div className="p-6 border-b border-border space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center">
                  <MessageSquare className="mr-3 text-primary" />
                  Customer Inquiries
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Manage feedback, questions and support messages</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative bg-muted/30 p-3 rounded-xl border border-border/50">
              <div className="relative group w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search by sender, email or subject..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground text-sm transition-all outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex items-center bg-background border border-border rounded-lg px-3 py-2">
                  <Layers size={14} className="text-muted-foreground mr-2" />
                  <select 
                    value={filterRead}
                    onChange={(e) => {
                      setFilterRead(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none text-sm text-foreground outline-none cursor-pointer pr-4 uppercase tracking-wider font-semibold"
                  >
                    <option value="all">All Messages</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-0">
            <BaseTable 
              headers={tableHeaders} 
              isLoading={loading} 
              skeletonCount={5}
              data={paginatedContacts}
              emptyMessage="No inquiries found."
              emptySubMessage="Adjust your search or wait for new messages."
              renderRow={(contact, i) => (
                <tr key={contact.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${!contact.is_read ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-6 align-middle text-sm text-muted-foreground font-medium">
                    {(currentPage - 1) * itemsPerPage + i + 1}
                  </td>
                  
                  {/* Sender Info */}
                  <td className="px-2 py-6 align-middle">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!contact.is_read ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {!contact.is_read ? <Mail size={18} /> : <MailOpen size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Subject */}
                  <td className="px-2 py-6 align-middle max-w-[200px]">
                    <p className={`font-semibold text-sm line-clamp-1 ${!contact.is_read ? 'text-primary' : 'text-foreground'}`}>
                      {contact.subject || 'No subject provided'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {contact.message}
                    </p>
                  </td>
                  
                  {/* Date Received */}
                  <td className="px-2 py-6 align-middle">
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                      {new Date(contact.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  
                  {/* Status */}
                  <td className="px-2 py-6 align-middle">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${!contact.is_read ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'}`}>
                      {!contact.is_read ? 'Unread' : 'Read'}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-6 align-middle text-center flex justify-center">
                    <BaseDropdown 
                      label="Actions"
                      items={[
                        { 
                          label: 'View Message', 
                          onClick: () => viewContactDetails(contact),
                          icon: <Eye size={14} className="mr-2" />
                        },
                        { 
                          label: 'Mark as Read', 
                          onClick: () => handleMarkAsRead(contact.id),
                          icon: <MailOpen size={14} className="mr-2" />,
                          hidden: contact.is_read
                        },
                        { 
                          label: 'Delete Message', 
                          onClick: () => handleDelete(contact.id),
                          icon: <Trash2 size={14} className="mr-2 text-destructive" />,
                          className: 'text-destructive focus:text-destructive'
                        }
                      ].filter(item => !item.hidden)}
                    />
                  </td>
                </tr>
              )}
            />
          </div>

          {!loading && filteredContacts.length > 0 && (
            <div className="p-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredContacts.length)} of {filteredContacts.length} inquiries
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex gap-1">
                  {getPageNumbers().map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === number 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-foreground hover:bg-muted border border-transparent'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showModal && selectedContact && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="fixed inset-0 bg-black/60 z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
              >
                <div className="bg-background rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col border border-border">
                  <div className="p-8 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                        <User size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{selectedContact.name}</h2>
                        <p className="text-sm text-primary font-semibold">{selectedContact.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 rounded-xl bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 flex items-center">
                          <Phone size={10} className="mr-1" /> Contact
                        </p>
                        <p className="font-semibold text-foreground text-sm">{selectedContact.phone || 'N/A'}</p>
                      </div>
                      <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 flex items-center">
                          <Calendar size={10} className="mr-1" /> Received
                        </p>
                        <p className="font-semibold text-foreground text-sm">{new Date(selectedContact.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Subject</p>
                      <h3 className="text-xl font-bold text-foreground leading-tight">
                        {selectedContact.subject || 'No subject provided'}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 flex items-center">
                        <Info size={10} className="mr-1" /> Message Content
                      </p>
                      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                          {selectedContact.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={() => handleDelete(selectedContact.id)}
                        className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-destructive/90 transition-all flex items-center justify-center"
                      >
                        <Trash2 size={16} className="mr-2" /> Delete Permanently
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-8 py-3 bg-muted text-muted-foreground rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-muted/80 transition-all border border-border"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

export default AdminContacts;
