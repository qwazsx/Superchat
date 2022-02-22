import './App.css';
// npm install firebase react-firebase-hooks dotenv

import React, { useState, useEffect, useRef } from 'react'
import firebase from 'firebase/compat/app' // firebase sdk importu
import 'firebase/compat/firestore' // db için import
import 'firebase/compat/auth' // user authentication için import

// hooklar
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
    //buraya config gelecek
    apiKey: process.env.REACT_APP_MESSAGE_API_KEY,
    authDomain: "mfcchatdemo.firebaseapp.com",
    projectId: "mfcchatdemo",
    storageBucket: "mfcchatdemo.appspot.com",
    messagingSenderId: "779319378231",
    appId: "1:779319378231:web:1692e2fd6c68fd01ac5ab2"
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {

    const [user] = useAuthState(auth)

    return (
        <div className="App">
            <header className="App-header">
                <h1>💬</h1>
                <SignOut />
            </header>
            <section>
                {user ? <ChatRoom /> : <SignIn />}
            </section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
    }

    return (
        <button onClick={signInWithGoogle}>Google İle Giriş</button>
    )
}
function SignOut() {
    return auth.currentUser && (
        <button className="sign-out" onClick={() => auth.signOut()}>Çıkış Yap</button>
    )
}
function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt', 'desc').limit(25);

    const [messages] = useCollectionData(query, { idField: 'id' });

    const [formValue, setFormValue] = useState('');


    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        })

        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }

    return (<>
        <main>

            {messages && messages.reverse().map(msg => <ChatMessage key={msg.id} message={msg} />)}

            <span ref={dummy}></span>

        </main>

        <form onSubmit={sendMessage}>

            <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Yaz Bakalım" />

            <button type="submit" disabled={!formValue}>Gönder</button>

        </form>
    </>)
}
// function ChatRoom() {

//     const dummy = useRef()
//     const messagesRef = firestore.collection('messages')
//     const query = messagesRef.orderBy('createdAt', 'desc').limit(25)

//     const [messages] = useCollectionData(query, { idField: 'id' })
//     console.log({ messages })

//     const [formValue, setFormValue] = useState('')

//     const sendMessage = async (e) => {
//         e.preventDefault()

//         const { uid, photoURL } = auth.currentUser

//         await messagesRef.add({
//             text: formValue,
//             createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//             uid,
//             photoURL
//         })

//         setFormValue('')

//         dummy.current.scrollIntoView({ behavior: 'smooth' })
//     }
//     return (
//         <>
//             <div>
//                 {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
//                 <div ref={dummy}></div>
//             </div>

//             <form onSubmit={sendMessage}>
//                 <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
//                 <button type="submit">Send</button>
//             </form>
//         </>
//     )
// }
function ChatMessage(props) {
    const { text, uid, photoURL } = props.message

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL} />
            <p>{text}</p>
        </div>
    )
}

export default App;
