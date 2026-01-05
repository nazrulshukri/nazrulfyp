import React from 'react';
import './woblecard.css'; // Import the styles
import image1 from '../img/assets/Flight promotion/9beee856-aab1-4220-ae8b-86e2b0248a66.png';
import image2 from '../img/assets/Flight promotion/AD-TravelV-MIX-950x550_en.jpg';
import image3 from '../img/assets/Flight promotion/Batik-Air-Travel-Air.jpg';
import image4 from '../img/assets/Flight promotion/Good-bye-summer-hello-autumn_1400.jpg';
import image5 from '../img/assets/Flight promotion/Kids-Fly-Free-with-Malaysia-Airlines-2-1024x668.jpg';
import image6 from '../img/assets/Flight promotion/MAS-Web.jpg';
import image7 from '../img/assets/Flight promotion/Mandiri_1140x499px_promocode.jpg';
import image8 from '../img/assets/Flight promotion/SouthAmerica.jpg';
import image9 from '../img/assets/Flight promotion/additional-flights-myy-750x562.jpg';
import image10 from '../img/assets/Flight promotion/british-airways-flight-14feb24-lp.png';
import image11 from '../img/assets/Flight promotion/download.jpeg';
import image12 from '../img/assets/Flight promotion/f2116171bc06963365d32be8a75029bd.jpg';
import image13 from '../img/assets/Flight promotion/images (1).jpeg';

const ImageGrid = () => {
    const images = [
        image1, image2, image3, image4, image5,
        image6, image7, image8, image9, image10,
        image11, image12, image13
    ];

    return (
        <div className="image-grid">
            {images.map((src, index) => (
                <div className="card" key={index}>
                    <img src={src} alt={`Flight promotion ${index + 1}`} />
                </div>
            ))}
        </div>
    );
};

export default ImageGrid;
