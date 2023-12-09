import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import MenuIcon from '@material-ui/icons/Menu';
import ClearIcon from '@material-ui/icons/Clear';
import { useContext } from "react";
import { AuthContext } from '../Context/AuthContext.js';

function Header() {
    const [menutoggle, setMenutoggle] = useState(false);
    const { user } = useContext(AuthContext);

    const Toggle = () => {
        setMenutoggle(!menutoggle);
    }

    const closeMenu = () => {
        setMenutoggle(false);
    }

    return (
        <div className="container-Head">
            <div className="header">
                <div className="logo-nav">
                    <Link href="#home" to='/'>
                        ICON
                    </Link>
                </div>
                <div className='nav-right'>
                    <ul className={menutoggle ? "nav-options active" : "nav-options"}>
                        <li className="option" onClick={() => { closeMenu() }}>
                            <Link href="#home" to='/'>
                                Home
                            </Link>
                        </li>
                        <li className="option" onClick={() => { closeMenu() }}>
                            <Link href="#books" to='/books'>
                                Books
                            </Link>
                        </li>
                        <li className="option" onClick={() => { closeMenu() }}>
                            <Link href='signin' to='/signin'>
                                {user ? 'Dashboard' : 'LogIn'}
                            </Link>
                        </li>
                        <li style={{padding: '10px', border: 'none'}}></li>
                    </ul>
                </div>

                <div className="mobile-menu" onClick={() => { Toggle() }}>
                    {menutoggle ? (
                        <ClearIcon className="menu-icon" style={{ fontSize: 40 }} />
                    ) : (
                        <MenuIcon className="menu-icon" style={{ fontSize: 40 }} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header;
