import React from 'react'
import AboutBanner from '../component/about-banner'
import AboutUs from '../component/about-us'
import HowWork from '../component/how-work'
import SEO from '../component/SEO'

function About() {
  return (
    <main>
      <SEO 
        title="About Us" 
        description="Learn more about Eacyclic, the easiest way to buy products online in Kerala and across India." 
        keywords="about eacyclic, online shopping Kerala, buy products Malappuram"
      />
      <AboutBanner />
      <AboutUs />
      <HowWork />
    </main>
  )
}

export default About