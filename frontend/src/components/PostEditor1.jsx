import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PostEditor1(){

    const [urlInp, setUrlInp] = useState('')
    const [disInp, setDisInp] = useState('')
    const [content, setContent] = useState("");

    const handleChange = (e) => {
        setContent(e.target.innerHTML); // Update the state with the content of the editor
    };
    const handlClick = (e) => {
        window.open(e.target.href, '_blank');
    }
    const toAddLink = (e)=>{
        const addedLink = document.querySelector(".addedLink")
        addedLink.style.display = 'block'
        const btn = document.querySelector('#add-link-btn')
        btn.addEventListener('click', ()=>{

            const urlInp = document.querySelector('#url-inp').value
            const disInp = document.querySelector('#display-inp').value
            const edit = document.querySelector('#editor')
            let editCont = edit.innerHTML
            editCont += ` <a href="${urlInp}" style="z-index: 99; position: relative;">${disInp}</a>`
            edit.innerHTML = editCont

        })
    }

    const handleUrlInp = (e) => {
        setUrlInp(e.target.value)
    }

    const handleDisInp = (e) => {
        setDisInp(e.target.value)
    }
    return (
        <>
            <a href={"https://3x.ant.design/components/comment/"}>hihi</a>
            <div id="editor" contentEditable="true" onInput={handleChange} onClick={(e) => {if (e.target.tagName==='A') handleClick(e)}} dangerouslySetInnerHTML={{ __html: content }}
                 style={{border: "1px solid #ccc", padding: "10px", height: "100px"}}></div>

            <div className="add-link" onClick={toAddLink}>
                add link
                <div className="addedLink" style={{display: 'none'}}>

                    <input id="url-inp" type="url"  value={urlInp} onChange={handleUrlInp} placeholder="your url" required={true}/>
                    <input id="display-inp" type="text"  value={disInp} onChange={handleDisInp} placeholder="display text"/>
                    <button id="add-link-btn">Add</button>

                </div>
            </div>
        </>
    )
}