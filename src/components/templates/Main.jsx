import './Main.css';
import React from 'react';
import Header from './Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default props => 
    <React.Fragment>
        <Header {...props} />
        <div className="p-3 mt-3">
        <ToastContainer />
        <main className="content container-fluid">
                {props.children}
            </main>
        </div>
    </React.Fragment>
