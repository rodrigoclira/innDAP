import React, { Component } from 'react';
import Main from '../templates/Main';
import api from '../../services/Axios';
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { defaultValidation } from '../util';

const headerProps = {
    icon: 'sitemap',
    title: 'LDAP',
    subtitle: 'Gerenciamento de servidor LDAP'
};

const uri = '/service'
const domain_uri = '/domain';

export default class UserCrud extends Component {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            ldap: {
                id: null,
                domain: null,
                ip: null,
                port: null,
                base_dn: null,
                bind_dn: null,
                bind_credential: null
            },
            open: false,
            modal: false,
            domain_list: []
        };
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    };


    componentDidMount() {
        api.get(uri)
            .then( resp => {
                const list = resp.data;
                this.setState({ list: list });
            })

        api.get(domain_uri)
            .then(resp => {
                let list = [];
                for(let domain of resp.data) {
                    list.push({value: domain.id, label: domain.name});
                }
                this.setState({ domain_list: list });
            })
    }

    handleOpenModal () {
        this.setState({ showModal: true });
    }
      
    handleCloseModal () {
        this.setState({ showModal: false });
    }

    isValid(ldap){
        const isValid = defaultValidation(ldap);   
        return isValid;
    }

    save() {
        const ldap = this.state.ldap;

        if (!this.isValid(ldap)){
            toast.warning("Todas os campos são obrigatórios", {
                position: toast.POSITION.TOP_RIGHT});
            return ;
        }

        this.toggle();
        let method = 'post';
        let to_uri = uri;
        if(ldap.id){
            method = 'put';
            to_uri = uri + `/${ldap.id}`;
        }

        api[method](to_uri, ldap)
            .then(resp => {
                const list = this.getUpdatedList(resp.data);
                this.setState({ ldap: ldap, list: list })
            })
    }

    confirmRemove = (e, ldap) => {
        confirmAlert({
          title: 'Confirmação',
          message: `Você tem certeza que quer remover ${ldap.ip}:${ldap.port}?`,
          buttons: [
            {
              label: 'Sim',
              onClick: () => this.remove(e, ldap)
            },
            {
              label: 'Cancelar',
              onClick: () => console.log(`Remoção de ${ldap.id}:${ldap.port} cancelada`)
            }
          ]
        });
      };


    remove(event, ldap) {
        api.delete(`${uri}/${ldap.id}`)
            .then(resp => {
                const list = this.state.list.filter(l => l !== ldap);
                this.setState({ list: list });
            })
    }

    editLdap(event, ldap){
        this.setState({ ldap: ldap})
        this.toggle(event, true)
    }

    getUpdatedList(ldap) {
        const list = this.state.list.filter( m => m.id !== ldap.id );
        list.unshift(ldap);
        return list;
    }

    updateField(event) {
        const ldap = { ...this.state.ldap };
        ldap[event.target.name] = event.target.value;
        this.setState({ ldap: ldap });
    }

    toggle(event, edit){

        if(!edit){
            let ldap = {
                id: null,
                domain: null,
                ip: null,
                port: null,
                base_dn: null,
                bind_dn: null,
                bind_credential: null
            };
            this.setState({ldap: ldap});
        }

        this.setState({ 
            open: !this.state.open,
            modal: !this.state.modal,
            icon: this.state.icon == 'left' ? 'down' : 'left'
        });
        
    }

    handleDomains(e){
        let ldap = this.state.ldap;
        ldap.domain = e.target.value;
        this.setState({ ldap: ldap });
    }

    selectDomains(){
        return (
            <div>
                <select className="form-select mb-3" value={this.state.ldap.domain} onChange={e => this.handleDomains(e)}>
                <option selected>Selecione o domínio</option>
                    {this.state.domain_list.map( d => (
                        <option value={d.value}>{d.label}</option>
                    ))}
                </select>
            </div>
        );
    }
    
    renderLdapTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <th></th>
                    <th>Domínio</th>
                    <th>IP</th>
                    <th>Porta</th>
                    <th>BASE_DN</th>
                    <th>BIND_DN</th>
                    <th>Ações</th>
                </thead>
                <tbody>
                    {this.renderLdapRows()}
                </tbody>
            </table>
        )
    }

    renderLdapRows(){
        let count = 0;
        return this.state.list.map(ldap => (
            <tr key={String(ldap.id)}>      
                <td>{++count}</td>
                <td>{ldap.domain}</td>
                <td>{ldap.ip}</td>
                <td>{ldap.port}</td>
                <td>{ldap.base_dn}</td>
                <td>{ldap.bind_dn}</td>
                <td>
                    <div>
                        <a href="#" className="text-info container" onClick={e => this.editLdap(e, ldap)} title="Editar">
                            <i className="fa fa-edit"></i>
                        </a>
                        <a href="#" className="text-danger container" onClick={e => this.confirmRemove(e, ldap)} title="Remover">
                            <i className="fa fa-remove"></i>
                        </a>
                    </div>
                </td>
            </tr>
            ));
    }

    renderLdapForm(){
        return (
            <div className="form">
            <div className="row">
                <div className="col-12 col-md-4">
                <div className="form-group">
                            <label>Domínio</label>
                            {this.selectDomains()}
                        </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="form-group">
                        <label>IP</label>
                        <input type="text" className="form-control"
                            name="ip"
                            value={this.state.ldap.ip}
                            onChange={e => this.updateField(e)}
                            placeholder="IP"
                        />
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="form-group">
                        <label>Porta</label>
                        <input type="text" className="form-control"
                            name="port"
                            value={this.state.ldap.port}
                            onChange={e => this.updateField(e)}
                            placeholder="Porta"
                        />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-12 col-md-12">
                    <div className="form-group">
                        <label>BASE DN</label>
                        <input type="text" className="form-control"
                            id="input_base_dn"
                            name="base_dn"
                            value={this.state.ldap.base_dn}
                            onChange={e => this.updateField(e)}
                            placeholder="OU=people,DC=exemplo,DC=br"
                        />
                    </div>
                </div>
                <div className="col-12 col-md-8">
                    <div className="form-group">
                        <label>BIND DN</label>
                        <input type="text" className="form-control"
                            id="input_bind_dn"
                            name="bind_dn"
                            value={this.state.ldap.bind_dn}
                            onChange={e => this.updateField(e)}
                            placeholder="CN=admin,DC=exemplo,DC=br"
                        />
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="form-group">
                        <label for="input_password">Senha</label>
                        <input type="password" className="form-control"
                            id="input_password"
                            name="bind_credential"
                            value={this.state.ldap.bind_credential}
                            onChange={e => this.updateField(e)}
                            placeholder="Senha"
                        />                        
                    </div>
                </div>
            </div>
            </div>
            );
    }


    renderModalLdap(){
        return (
            <div>
                <Modal 
                show={this.state.modal} 
                onHide={e => {this.toggle(e)}}
                size="lg"
                backdrop="static"
                >
                    <Modal.Header>
                    <Modal.Title><icon className="fa fa-plus"></icon> Adicionar Nova Base LDAP </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.renderLdapForm()}
                    </Modal.Body>
                    <Modal.Footer>
                    <button className="btn btn-outline-success"
                        onClick={e => this.save(false)}
                    >
                        Salvar
                    </button>
                    <button  className="btn btn-outline-danger"
                    onClick={e => {this.toggle(e, true)}}>
                        Cancelar
                    </button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    render() {
        return (
            <Main {...headerProps}>
                {this.renderModalLdap()}               
                <Navbar bg="light" variant="light">
                <div className="container">
                    <Navbar.Brand href="#home"></Navbar.Brand>
                    <Nav className="text-left">
                        <input type="button" className="btn btn-info d-flex justify-content-end" id="add-domain" href="#" onClick={e => this.toggle(e)} value="Adicionar"></input>
                    </Nav>
                </div>
                </Navbar>
                     {this.renderLdapTable()}
            </Main>
        )
    }
}
