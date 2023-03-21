import './Footer.css';
import React from 'react';

export default props => 
    <footer className="footer">
        <div className="table">
        <div className="col-12 col-md-12 d-flex justify-content-end">
            <div className="footer-copyright">
                <div className="container">
                    {/* © 2022 Copyright RNP */}
                </div>
            </div>
        </div>
        <div className="col-12 col-md-12 d-flex justify-content-end">
            <span>
            <a className="grey-text text-lighten-4 right" href="https://magno.eng.br" rel="noreferrer" target="_blank">Developed by Magno Andrade</a>
            </span>
        </div>
        </div>
    </footer>
