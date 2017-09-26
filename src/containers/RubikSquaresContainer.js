import React from 'react';
import RubikSquare from './../components/RubikSquare';
import ReactCountdownClock from 'react-countdown-clock';
import axios from 'axios';
import ReactPDF from 'react-pdf';

export default class RubikSquaresContainer extends React.Component {

	constructor(props) {
		super(props);
		this.RUBIK_CONTAINER_SIZE = 16;
		this.ROW_LENGTH = Math.sqrt(this.RUBIK_CONTAINER_SIZE);
		this.startTime = Date.now(),this.endTime = 0;
		this.state = {
			squaresColors: this.randomSquareColors(),
			moves:0,
			isGameOver:false,
			timeUp:false,
			loginSuccessful: false,
			userName:'',
			results: []
		}
	}

	swap(src,trgt,array) {
		let temp = array[src];
		array[src] = array[trgt];
		array[trgt] = temp;
		return array;
	}

	isRowWiseOver(colorsArray){
			let color;
			for(let i=0;i < colorsArray.length; i++){
				if(i%this.ROW_LENGTH == 0){
					color = colorsArray[i];
				}
				else{
					if(color === colorsArray[i]) {
						continue;
					}
					else {
						return false;
					}
				}
			}
			return true;
	}

	isColumnWiseOver(colorsArray) {
		let color;
		for(let i= this.ROW_LENGTH;i < colorsArray.length; i++){
			  if(colorsArray[i] === colorsArray[i%this.ROW_LENGTH]) {
					continue;
				}
				else {
					return false;
				}
		}
		return true;
	}

	isGameOver(colorsArray){
		return this.isRowWiseOver(colorsArray) || this.isColumnWiseOver(colorsArray);
	}

	onSwipe(sourceIndex,targetIndex) {
		let swappedSquaresColors = this.swap(sourceIndex,targetIndex,this.state.squaresColors);

		this.setState({
			squaresColors:swappedSquaresColors,
			moves: ++this.state.moves,
			isGameOver: this.isGameOver(swappedSquaresColors)
		});
	}

	formRubikSquaresContainer(squareColors) {
		let squareBlocks = squareColors.map(function(color,i){
				return (<RubikSquare
					key={i}
					index={i}
					color={color}
					onSwipe={this.onSwipe.bind(this)}
				/>);
		}.bind(this));
		return squareBlocks;
	}

	randomColorPicker(colorsArray, colorsCountArray) {
		let randomColorCode= Math.floor(Math.random() * (colorsArray.length));
		let color = colorsArray[randomColorCode];
		colorsCountArray[randomColorCode]++;
		if(colorsCountArray[randomColorCode] == this.ROW_LENGTH){
			colorsArray.splice(randomColorCode,1);
			colorsCountArray.splice(randomColorCode,1);
		}
		return color;
	}

	randomSquareColors() {
		let squares = [];
		let colorsArray = ['#055994','#034003','#8c6804','#a20303'];
		let colorsCountArray = [0,0,0,0];
		for(let i=0;i<this.RUBIK_CONTAINER_SIZE;i++) {
			let color = this.randomColorPicker(colorsArray,colorsCountArray)
			squares.push(color);
		}
		return squares;
	}

	onTimeUp() {

		this.setState({timeUp:true})
	}
	getData(){

		//console.log("Winner");
	}

	postData() {
		this.endTime = Date.now();
		let totalTime = Math.floor((this.endTime - this.startTime)/1000);
		axios.post('http://sample-env.d8kzn4afvm.us-east-1.elasticbeanstalk.com/api/Rubiks', {
    			UserName: this.state.userName,
    			moves: this.state.moves,
    			timing: totalTime
  			})
  			.then(function (response) {
   				 console.log("successfully posted");
  			})

	}

	componentDidMount(){
        axios.get('http://sample-env.d8kzn4afvm.us-east-1.elasticbeanstalk.com/api/Rubiks?filter=%7B%22order%22%3A%22timing%20ASC%22%2C%20%22limit%22%3A%2010%2C%20%22where%22%3A%20%7B%22moves%22%3A%20%7B%22lte%22%3A20%7D%7D%20%7D').then(function (response) {
            console.log("successfully posted");
            console.log("Winner");
            console.log(response);
            const results = response.map(obj => obj.data);
            this.setState({ results });
		});
	}

    startGame(){
        return (
			<div>
				<div className='countdown-container'>
					<ReactCountdownClock seconds={30}
										 color="#000"
										 size={100}
										 paused={this.state.isGameOver}
										 onComplete={this.onTimeUp.bind(this)}
					/>
				</div>
				<div className='rubikSquaresContainer'>
                    {this.formRubikSquaresContainer(this.state.squaresColors)}
				</div>

				<ul>
                    {this.state.posts.map(post =>
						<li key={post.username}>{post.moves}{post.timing}</li>
                    )}
				</ul>
                {this.state.isGameOver || this.state.timeUp ? this.postData() : false}
                {this.state.isGameOver ? <div className='game-over'><span>good job!!!</span></div>: false}
                {this.state.timeUp ? <div className='time-up'><span>time up!!!</span></div>: false}
			</div>
        );
	}

    onStart(e) {
    	console.log('on start');
    	e.preventDefault();
    	this.setState({ loginSuccessful:true,userName: this.refs.userName.value});
    }

    userLogin() {
        return (
			<div className='loginContainer'>
				<h1> Welcome to 2D Rubik's cube </h1>
				<div> Swipe either horizontally or vertically and try to bring all colors to one place</div>
				<div> Please enter your user name and click button to start game</div>
				<form onSubmit={this.onStart.bind(this)}>
					<input type="text" ref="userName" />
					<input type="submit" value="Lets Start the Game"/>
				</form>
				
			</div>
        );
    }

	render() {
		console.log(this.state);
		return this.state.loginSuccessful === true ? this.startGame() : this.userLogin()
	}
}
