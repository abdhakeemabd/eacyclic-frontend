import React from 'react'
import ContactBanner from '../component/contact-banner'
import ContactForm from '../component/contact-form'
import SEO from '../component/SEO'

function Contact() {
  return (
    <main>
      <SEO 
        title="Contact Us" 
        description="Get in touch with Eacyclic. We are here to help you with your online shopping experience in Kerala." 
        keywords="contact eacyclic, eacyclic support, customer service"
      />
      <ContactBanner />
      <ContactForm />
    </main>
  )
}

export default Contact