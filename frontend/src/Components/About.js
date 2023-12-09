import React from 'react'
import './About.css'

function About() {
    return (
        <div className='about-box'>
            <h2 className="about-title">About the Library</h2>
            <div className="about-data">
                <div className="about-img">
                    <img src="https://images.unsplash.com/photo-1583468982228-19f19164aee2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=913&q=80" alt="" />
                </div>
                <div>
                <p className="about-text">
                    Library management system For IIIT Manipur, designed by Tushar Mohanpuria for both students and staff, leverages the MERN stack to revolutionize traditional library management. Operating as a web-based platform, it introduces automation across various tasks, ensuring a seamless experience for users. Notable features include the automatic generation of QR codes for book copies, simplifying the borrowing process, and the integration of UPI deep link QR codes for fines.
                    <br /><br />
                    This tech-driven system eliminates manual entry by automatically extracting book data using ISBN, enhancing efficiency. Students benefit from a due date notification system and a self-checkout option, promoting effective management of borrowings. Reviews from previous students foster a sense of community, providing valuable insights for new borrowers. Users can preview and evaluate books, making informed decisions tailored to their preferences. Our library exemplifies the transformative power of technology, creating a modern, efficient, and user-centric environment.
                    <br /><br />
                    Your suggestions for improvement are always welcome!
                </p>
                </div>
            </div>
        </div>
    )
}

export default About
