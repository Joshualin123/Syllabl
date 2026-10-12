"use client"
import styles from "./game.module.css";
import {useState, useEffect} from 'react';

export default function Game() {

    const [time, setTime] = useState(10);
    const [totalTime, setTotalTime] = useState(10);

    const [word, setWord] = useState("");
    const [inputWord, setInputWord] = useState("");

    const [errMsg, setErrMsg] = useState("");

    async function getWord() {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "polls/get-word")

        const data = await response.json();

        setWord(data.word);
    }

    useEffect(() => { //run on mount

        console.log(word)
        getWord(); 

    }, []);

    async function checkWord() {

        console.log("ran checkWord");

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "polls/check-word", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({initial_word: word, input_word: inputWord})
        })

        const data = await response.json();
        
        if (data.message == "Valid") {
            setInputWord(""); //clear input box
            getWord(); //get new word
        } else {
            setErrMsg(data.message);
            console.log(errMsg)
        }

    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTime((prev) => prev - 0.01);
        }, 10);

        return () => clearInterval(timer);
    }, []);

    return (
        <main className={styles.game}>
            <div className={styles.gameMidContainer}>
                <div className={styles.gameOldWordContainer}>{word}</div>
                <div className={styles.gameBarTrack}>
                    <div className={styles.gameBar} style={{width: `${(time / totalTime) * 100}%`}}></div>
                </div>
                <input 
                    className={styles.gameNewWordContainer} 
                    placeholder="Enter word here..." 
                    value={inputWord} 
                    onChange={(e) => setInputWord(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            checkWord();
                        }
                    }}
                >
                </input>
            </div>
        </main>
    );
}