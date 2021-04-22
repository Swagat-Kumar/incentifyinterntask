import './App.css';
import React, { useState,useRef } from 'react';

//Components Required

//Styling
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle';

function App() {
  const clientOb={client_id:'7257cbbf380d4f198679b19542f2ab2a',client_secret:'447ea0db32e94f4991cbfb369db4d9f4'};

  const [message,setMessage]=useState('');
  const [dragging,setDragging]=useState(false);
  const [items,setItems]=useState([{title:'Editor\'s List',members:[]},{title:'User\'s List',members:[]}]);

  const dragItem=useRef();
  const dragNode=useRef();



  const handleDragStart = (e,params) =>{
    // console.log('drag starting...',params);
    document.body.style.cursor = 'grabbing';
    dragItem.current=params;
    dragNode.current=e.target;
    dragNode.current.addEventListener('dragend',handleDragEnd);
    setTimeout(()=>{
      setDragging(true);
    },0)
  }

  const handleDragEnd = () =>{
    // console.log('Ending Drag....');
    document.body.style.cursor = 'grab';
    setDragging(false);
    dragNode.current.removeEventListener('dragend',handleDragEnd);
    dragItem.current=null;
    dragNode.current=null;
  }
  

  const handleDragEnter = (e,params) =>{
    // console.log('Enter....');
    const currentItem=dragItem.current;
    if(e.target!== dragNode.current){
      // console.log('Target Not Same');
      setItems(oldItems=>{
        let newItems=JSON.parse(JSON.stringify(oldItems));
        newItems[params.listIndex].members.splice(params.memberIndex,0,newItems[currentItem.listIndex].members.splice(currentItem.memberIndex,1)[0]);
        dragItem.current=params;
        return newItems
      })
      localStorage.setItem('userListItems',JSON.stringify(items[1].members));
    }
  }

  const getStyles =(params)=>{
    const currentItem=dragItem.current;
    if(currentItem.listIndex===params.listIndex && currentItem.memberIndex===params.memberIndex){
      return 'current card mb-3 mx-auto'
    }
    return 'card mb-3 mx-auto'
  }


  React.useEffect(()=>{
    fetch('https://accounts.spotify.com/api/token',{
      method:'POST',
      headers:{
        'Content-Type':'application/x-www-form-urlencoded',
        'Authorization':'Basic '+btoa(clientOb.client_id+':'+clientOb.client_secret)
      },
      body:'grant_type=client_credentials'
    })
    .then(response => response.json())
    .then(data=>{
      console.log(data.access_token);
      fetch('https://api.spotify.com/v1/browse/featured-playlists?country=IN&locale=en_IN',{
        method:'GET',
        headers:{'Authorization':'Bearer '+data.access_token}
      })
      .then(response=>response.json())
      .then(data=>{
        setMessage(data.message.toUpperCase());
        let userItems=localStorage.getItem('userListItems');
        // console.log(userItems)
        if(userItems){
          userItems=JSON.parse(userItems);
        }else{
          userItems=[];
        }
        setItems([{title:'Editor\'s List',members:data.playlists.items},{title:'User\'s List',members:userItems}]);
        console.log(data.playlists.items);
      })
    })
    .catch(console.log('access token not received'))
    },
    [clientOb.client_id,clientOb.client_secret]);



  return (
    <div className={`App pb-4 ${dragging?'dragging':'notdragging'}`}>
      <header>
        <h2 className='App-header mb-5'>{message}</h2>
      </header>
      <div className="row mx-auto">
        <div className="col-10 mx-auto">
          <div className="row">
            {items.map((list,listIndex)=>(
              <div onDragEnter={dragging && !list.members.length?(e)=>handleDragEnter(e,{listIndex,memberIndex:0}):null}className='col-5 mx-auto list' key={listIndex}>
                <h4 className='listName'>{list.title.toLocaleUpperCase()}</h4>
                {list.members.map((member,memberIndex)=>(
                    <div
                      draggable
                      onDragStart={(e)=>{handleDragStart(e,{listIndex,memberIndex})}}
                      onDragEnter={dragging?(e)=>{handleDragEnter(e,{listIndex,memberIndex})}:null}
                      key={memberIndex} 
                      className={dragging?getStyles({listIndex,memberIndex}):'card mb-3 mx-auto'} 
                      style={{maxWidth: '540px'}}>
                        <div className="row g-0">
                            <div className="col-md-4">
                            <img src={member.images[0].url} alt={member.name} style={{width:'100%',objectFit:'cover'}}/>
                            </div>
                            <div className="col-md-8">
                            <div className="card-body">
                                <h5 className="card-title">{member.name}</h5>
                                <p className="card-text">{member.description}</p>
                                <p className="card-text"><small className="text-muted">{list.title}</small></p>
                            </div>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
