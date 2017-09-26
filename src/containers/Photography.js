/**
 * Created by KChaitanya on 7/22/2017.
 */
import React from 'react';

export default class Photography extends React.Component{
    constructor(props){
        super(props);
        this.state= {
            title:'chaitu'
        };
    }
    photo(){
        this.setState({title:'Photo is life'})
    }
    album(){
        return(
            <div>My name is krishna Chaitanya</div>
        )
    }

    render(){

        return (<div>{this.state.title}
            <button onClick={this.photo.bind(this)}>Change it</button>
            <button onClick={this.state.title}>Refactor</button>
            </div>);
    }
}