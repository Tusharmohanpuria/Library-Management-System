import React from 'react'
import './PhotoGallery.css'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

function PhotoGallery() {
    return (
        <div className='photogallery-container'>
            <h1 className='photogallery-title'>Photo Gallery</h1>
            <div className="photogallery-images">
                <img src="" alt='IMG-1'/>
                <img src="" alt='IMG-2'/>
                <img src="" alt='IMG-3'/>
                <img src="" alt='IMG-4'/>
                <img src="" alt='IMG-5'/>
                <img src="" alt='IMG-6'/>
                <img src="" alt='IMG-7'/>
                <img src="" alt='IMG-8'/>
                <img src="" alt='IMG-9'/>
                <img src="" alt='IMG-10'/>
            </div>
            <button>VIEW MORE<ArrowForwardIosIcon style={{fontSize:20}}/></button>
        </div>
    )
}

export default PhotoGallery