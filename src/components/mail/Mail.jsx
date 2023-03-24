import React, { Component } from 'react';
import Main from '../templates/Main';
import api from '../../services/Axios';
import { Modal } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { defaultValidation } from '../util';

let props = {
    selectedValue: null
};

const headerProps = {
    icon: 'envelope',
    title: 'E-mail',
    subtitle: 'Gerenciamento de e-mails'
};

const uri = "/mail-server";
const domain_uri = "/domain";

export default class MailCrud extends Component {

    constructor(props) {
        super(props);
        this.state = {
            list: [],
            mail: {
                id: null,
                domain: null,
                address: null,
                server: null,
                port: null,
                protocol: null
            },
            open: false,
            modal: false,
            domain_list: [],
            protocol_list: [
                {value: 'TLS', label: 'Protocolo TLS'},
                {value: 'SSL', label: 'Protocolo SSL'}
            ]
        };
        this.selectProtocolRef = null;
        this.selectDomainsRef = {label: "sa", value: 'sa'};
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleDomains = this.handleDomains.bind(this);
        this.handleProtocols = this.handleProtocols.bind(this);
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

    isValid(mail){
        const isValid = defaultValidation(mail, ['id']);   
        return isValid;
    }

    save() {
        const mail = this.state.mail;
        
        if (!this.isValid(mail)){
            toast.warning("Todas os campos são obrigatórios", {
                position: toast.POSITION.TOP_RIGHT});
            return ;
        }

        this.toggle();
        let method = 'post';
        let to_uri = uri;
        if(mail.id){
            method = 'put';
            to_uri = uri + `/${mail.id}`;
        }
        api[method](to_uri, mail)
            .then(resp => {
                const list = this.getUpdatedList(resp.data);
                this.setState({ mail: mail, list: list })
            }).catch((error) =>{

                if (error.response.data.message.includes("pymysql.err.IntegrityError")){
                    toast.error("Erro de adição do e-mail", {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }else{
                    toast.error("Erro inesperado", {
                        position: toast.POSITION.TOP_RIGHT
                    });   
                }
                console.log("error:" + error.response.data.message)        
            });
    }

    getUpdatedList(mail) {
        const list = this.state.list.filter( m => m.id !== mail.id );
        list.unshift(mail);
        return list;
    }

    updateField(event) {
        const mail = { ...this.state.mail };
        mail[event.target.name] = event.target.value;
        this.setState({ mail: mail });
    }

    toggle(event, id){
        if(!id){
            let mail = {
                id: null,
                domain: null,
                address: null,
                server: null,
                port: null,
                protocol: null
            };
            this.setState({mail: mail});
        }
        this.setState({ 
            open: !this.state.open,
            modal: !this.state.modal,
            icon: this.state.icon == 'left' ? 'down' : 'left'
        });  
    }
    
    renderMailTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <th></th>
                    <th>Domínio</th>
                    <th>E-mail</th>
                    <th>Servidor</th>
                    <th>Porta</th>
                    <th>Protocolo</th>
                    <th>Ações</th>
                </thead>
                <tbody>
                    {this.renderMailRows()}
                </tbody>
            </table>
        )
    }

    renderMailRows(){
        let count = 0;
        return this.state.list.map(mail => (
            <tr key={String(mail.id)}>      
                <td>{++count}</td> 
                <td>{mail.domain}</td>
                <td>{mail.address}</td>
                <td>{mail.server}</td>
                <td>{mail.port}</td>
                <td>{mail.protocol}</td>
                <td>
                    <div>
                        <a className="text-info container"
                            onClick={e => this.editMail(e, mail)}
                            title="Editar">
                        <i className="fa fa-edit"></i>
                        </a>
                        
                        <a className="text-danger container"
                            onClick={e => this.confirmRemove(e, mail)}
                            title="Remover">
                        <i className="fa fa-remove"></i>
                        </a>
                    </div>                            
                </td>
            </tr>
            ));
    }

    renderMailForm() {
        return(
            <div className="form">
                <div className="row">
                <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Domínio</label>
                            {this.selectDomains()}
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>E-mail</label>
                            <input type="text" className="form-control"
                                name="address"
                                value={this.state.mail.address}
                                onChange={e => this.updateField(e)}
                                placeholder="Endereço de e-mail"
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Servidor</label>
                            <input type="text" className="form-control"
                                name="server"
                                value={this.state.mail.server}
                                onChange={e => this.updateField(e)}
                                placeholder="FQDN ou IP do servidor de e-mail"
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Porta</label>
                            <input type="number" className="form-control"
                                name="port"
                                value={this.state.mail.port}
                                onChange={e => this.updateField(e)}
                                placeholder="Ex.: 465"
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Protocolo</label>
                            {this.selectProtocol()}
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Senha</label>
                            <input type="password" className="form-control"
                                name="password"
                                value={this.state.mail.password}
                                onChange={e => this.updateField(e)}
                                placeholder="Senha do servidor de e-mail"
                            />
                        </div>
                    </div>

                </div>
                <hr />
                <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                        <button className="btn btn-outline-success"
                            onClick={e => this.save(e)}
                        >
                            Salvar
                        </button>
                        

                        <button className="btn btn-outline-danger ml-2"
                            onClick={e => this.toggle(e)}    
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    handleDomains(e){
        let mail = this.state.mail;
        mail.domain = e.target.value;
        this.setState({ mail: mail });
    }

    selectDomains(){
        return (
            <div>
                <select className="form-select mb-3" value={this.state.mail.domain} onChange={e => this.handleDomains(e)}>
                <option selected>Selecione o domínio</option>
                    {this.state.domain_list.map( d => (
                        <option value={d.value}>{d.label}</option>
                    ))}
                </select>
            </div>
        );
    }

    handleProtocols(e){
        let mail = this.state.mail;
        mail.protocol = e.target.value;
        this.setState({ mail: mail });
    }

    selectProtocol(){
        return (
            <div>
                <select className="form-select mb-3" value={this.state.mail.protocol} onChange={e => this.handleProtocols(e)}>
                <option selected>Selecione o protocolo</option>
                    {this.state.protocol_list.map( p => (
                        <option value={p.value}>{p.label}</option>
                    ))}
                </select>
            </div>
        );
    }


    editMail(event, mail){

        
        const d_list = [...this.state.domain_list];
        d_list.filter(d => d.value == mail.domain );
        const p_list = [...this.state.protocol_list];
        p_list.filter(p => p.value = mail.protocol );

        let domain_selected = null;
        let protocol_selected = null;
        if(d_list){ domain_selected = d_list.pop(); }
        if(p_list){ protocol_selected = p_list.pop(); }

        if(this.selectProtocolRef){
            this.selectProtocolRef.setValue(protocol_selected);
        }
        
        this.setState({ mail: mail, selectProtocolRef: protocol_selected });
        this.toggle(event, mail.id);
    }

    load(mail) {
        this.setState({ mail: mail });
    }

    confirmRemove = (e, mail) => {
        confirmAlert({
          title: 'Confirmação',
          message: `Você tem certeza que quer remover ${mail.address}?`,
          buttons: [
            {
              label: 'Sim',
              onClick: () => this.remove(e, mail)
            },
            {
              label: 'Cancelar',
              onClick: () => console.log(`Remoção de ${mail.address} cancelada`)
            }
          ]
        });
      };

    remove(event, mail) {
        api.delete(`${uri}/${mail.id}`)
            .then(resp => {
                const list = this.state.list.filter(m => m !== mail);
                this.setState({ list: list });
            })
    }

    render_modal_mail(){
        return (
            <div>
                <Modal 
                show={this.state.modal} 
                onHide={e => {this.toggle(e)}}
                size="lg"
                >
                    <Modal.Header>
                    <Modal.Title><icon className="fa fa-plus"></icon> Adicionar Servidor de E-mail</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.renderMailForm()}
                    </Modal.Body>
                </Modal>
            </div>
        );
    }

    render() {
        return (
            <Main {...headerProps}>
                {this.render_modal_mail()}
                <Navbar bg="light" variant="light">
                <div className="container">
                    <Navbar.Brand href="#home"></Navbar.Brand>
                    <Nav className="text-left">
                        <input type="button" className="btn btn-info d-flex justify-content-end" id="add-domain" href="#" onClick={e => this.toggle(e)} value="Adicionar"></input>
                    </Nav>
                </div>
                </Navbar>
                    {this.renderMailTable()}
            </Main>
        )
    }
}