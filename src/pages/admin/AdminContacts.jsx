import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mail, MailOpen, Trash2, 
  Phone, User, Calendar, MessageSquare, 
  X, Info, Layers, Eye, ChevronLeft, ChevronRight,
  ExternalLink, Reply, CheckCircle2, Clock, RefreshCw
} from 'lucide-react';
import { contactAPI } from '../../utils/api';
import { BaseTable } from '../../components/shadcn-custom/BaseTable';
import { BaseDropdown } from '../../components/shadcn-custom/BaseDropdown';
import { useSearchParams } from 'react-router-dom';
import AdminStatCard from '../../component/AdminStatCard';
import { showSuccess, showError, showConfirm } from '../../utils/swalUtils';

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
      
      apiContacts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setContacts(apiContacts);
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
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, is_read: true } : c));
    } catch (error) {
      console.warn('Error marking contact as read:', error);
    }
  };

  const handleDelete = async (contactId) => {
    const result = await showConfirm(
      'Delete Message',
      'Are you sure you want to permanently delete this customer inquiry?',
      'Yes, Delete',
      'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
    );

    if (result.isConfirmed) {
      try {
        await contactAPI.delete(contactId);
        showSuccess('Deleted', 'Message removed successfully.');
        setContacts(prev => prev.filter(c => c.id !== contactId));
        if (selectedContact?.id === contactId) {
          setShowModal(false);
        }
      } catch (error) {
        showError('Delete Failed', 'Failed to delete message.');
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

  const unreadCount = useMemo(() => contacts.filter(c => !c.is_read).length, [contacts]);
  const readCount = useMemo(() => contacts.filter(c => c.is_read).length, [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = 
        (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.message || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRead = 
        filterRead === 'all' ||
        (filterRead === 'unread' && !contact.is_read) ||
        (filterRead === 'read' && contact.is_read);
      return matchesSearch && matchesRead;
    });
  }, [contacts, searchTerm, filterRead]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage) || 1;
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const tableHeaders = [
    { label: '#' },
    { label: 'Customer / Sender' },
    { label: 'Subject & Inquiry' },
    { label: 'Date Received' },
    { label: 'Status' },
    { label: 'Actions', className: 'text-right' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-xs border border-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center">
              <MessageSquare className="mr-3 text-primary" />
              Customer Inquiries
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Review and respond to messages, questions, and customer support requests.</p>
          </div>
          <button
            onClick={fetchContacts}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer self-start md:self-auto border border-border"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Inbox</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminStatCard 
            icon={MessageSquare} 
            title="Total Messages" 
            value={contacts.length} 
            color="text-primary" 
            delay={0.1}
          />
          <AdminStatCard 
            icon={Mail} 
            title="Unread Inquiries" 
            value={unreadCount} 
            color="text-amber-500" 
            delay={0.2}
          />
          <AdminStatCard 
            icon={MailOpen} 
            title="Resolved / Read" 
            value={readCount} 
            color="text-emerald-500" 
            delay={0.3}
          />
        </div>

        {/* Filter Controls & Search */}
        <div className="space-y-3 pt-2">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
            {[
              { id: 'all', label: 'All Inquiries', count: contacts.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'read', label: 'Read & Archived', count: readCount }
            ].map(tab => {
              const isActive = filterRead === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterRead(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    isActive 
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs' 
                      : 'bg-background hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative group w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search sender, email, subject, text..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-8 py-2 bg-background border border-border rounded-xl text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <span className="text-xs text-muted-foreground self-end sm:self-auto font-medium">
              Showing {paginatedContacts.length} of {filteredContacts.length} message{filteredContacts.length === 1 ? '' : 's'}
            </span>
          </div>

        </div>
      </div>

      {/* Messages Table Card */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <BaseTable 
          headers={tableHeaders} 
          isLoading={loading} 
          skeletonCount={5}
          data={paginatedContacts}
          emptyMessage="No inquiries found."
          emptySubMessage="Try adjusting your filter or wait for customer inquiries."
          renderRow={(contact, i) => {
            const initials = (contact.name || 'C').substring(0, 2).toUpperCase();

            return (
              <tr 
                key={contact.id} 
                className={`border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${!contact.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                onClick={() => viewContactDetails(contact)}
              >
                <td className="px-3 py-4 align-middle text-xs text-muted-foreground font-medium">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
                
                {/* Sender */}
                <td className="px-3 py-4 align-middle">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      !contact.is_read 
                        ? 'bg-primary text-primary-foreground shadow-xs' 
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {initials}
                    </div>
                    <div>
                      <p className={`font-semibold text-xs leading-tight ${!contact.is_read ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {contact.name || 'Anonymous Sender'}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{contact.email}</p>
                    </div>
                  </div>
                </td>
                
                {/* Subject & Preview */}
                <td className="px-3 py-4 align-middle max-w-[280px]">
                  <p className={`text-xs font-semibold truncate ${!contact.is_read ? 'text-foreground font-bold' : 'text-foreground/90'}`}>
                    {contact.subject || 'No subject'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {contact.message}
                  </p>
                </td>
                
                {/* Date */}
                <td className="px-3 py-4 align-middle text-xs text-muted-foreground">
                  <span className="block font-medium">
                    {contact.created_at ? new Date(contact.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                  </span>
                  <span className="text-[10px] text-muted-foreground/80">
                    {contact.created_at ? new Date(contact.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </td>
                
                {/* Status Badge */}
                <td className="px-3 py-4 align-middle">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    !contact.is_read 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${!contact.is_read ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {!contact.is_read ? 'Unread' : 'Read'}
                  </span>
                </td>
                
                {/* Actions */}
                <td className="px-4 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                  <BaseDropdown 
                    label="Actions"
                    items={[
                      { 
                        label: 'View Message', 
                        onClick: () => viewContactDetails(contact),
                        icon: <Eye size={14} className="mr-2 text-primary" />
                      },
                      { 
                        label: 'Reply via Email', 
                        onClick: () => window.open(`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject || 'Inquiry')}`),
                        icon: <Reply size={14} className="mr-2 text-blue-500" />
                      },
                      { 
                        label: 'Mark as Read', 
                        onClick: () => handleMarkAsRead(contact.id),
                        icon: <MailOpen size={14} className="mr-2" />,
                        hidden: contact.is_read
                      },
                      { type: 'separator' },
                      { 
                        label: 'Delete Message', 
                        onClick: () => handleDelete(contact.id),
                        icon: <Trash2 size={14} className="mr-2 text-destructive" />,
                        danger: true
                      }
                    ].filter(item => !item.hidden)}
                  />
                </td>
              </tr>
            );
          }}
        />

        {/* Pagination Footer */}
        {!loading && filteredContacts.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-medium">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredContacts.length)} of {filteredContacts.length} inquiries
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              
              <span className="text-xs font-bold px-3 py-1 bg-primary text-primary-foreground rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {showModal && selectedContact && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl z-[101] overflow-hidden p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {(selectedContact.name || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{selectedContact.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{selectedContact.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Message Meta Info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 border border-border/60 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Subject</span>
                  <span className="font-semibold text-foreground">{selectedContact.subject || 'General Inquiry'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Received Date</span>
                  <span className="font-semibold text-foreground">
                    {selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleString('en-IN') : 'Recent'}
                  </span>
                </div>
                {selectedContact.phone && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Phone</span>
                    <a href={`tel:${selectedContact.phone}`} className="font-semibold text-primary hover:underline">
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <span className="text-xs uppercase font-bold text-muted-foreground block">Inquiry Message Body</span>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedContact.message}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  className="px-3.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted text-foreground cursor-pointer"
                  >
                    Close
                  </button>
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject || 'Inquiry')}`}
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Reply size={14} /> Reply via Email
                  </a>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AdminContacts;
