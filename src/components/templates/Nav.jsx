import './Nav.css';
import React from 'react';
import NavItems from './NavItems';
//import NavDropdown from 'react-bootstrap/NavDropdown';


export default props => 
    <aside className="menu-area">
        <nav className="menu">
            <NavItems icon="home" route="/" name="Início"/>
            <NavItems icon="building" route="domains" name="Domínios"/>
            <NavItems icon="envelope" route="mail" name="E-mail" />
            <NavItems icon="sitemap" route="ldap" name="LDAP" />
            <NavItems icon="users" route="users" name="Usuários"/>            
            <NavItems icon="cogs" route="config" name="Configurações"/>
            <NavItems icon="sign-out" route="logout" name="Sair"/>
        </nav>
    </aside>
