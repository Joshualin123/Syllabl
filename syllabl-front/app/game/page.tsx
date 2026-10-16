"use client"
import styles from "./game.module.css";
import {useState, useEffect} from 'react';

export default function Game() {

    //timer units are in seconds
    const [time, setTime] = useState(5); //remaining time for curr word
    const [totalTime, setTotalTime] = useState(5); //total time given per word
    const [totalGameTime, setTotalGameTime] = useState(5); //total game duration

    const [word, setWord] = useState(""); // starting/initial word
    const [inputWord, setInputWord] = useState(""); //users input
    const [score, setScore] = useState(0); //score per word will be based on length of final syllable, and if the final syllable is an entire word itself

    const [errMsg, setErrMsg] = useState(""); 
    const [errBool, setErrBool] = useState(false);

    const [gameEndBool, setGameEndBool] = useState(false);

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
            setTime(totalTime); //reset timer
            setErrBool(false); //remove err msg
        } else {
            setErrMsg(data.message);
            setErrBool(true);
            console.log(errMsg)
        }

    }

    //word timer
    useEffect(() => {

        if (gameEndBool) {
            return;
        }

        const timer = setInterval(() => {
            setTime((prev) => {

                if (prev - 0.01 <= 0.01) { //restart if out of time
                    getWord(); 
                    setInputWord(""); //clear input box
                    return totalTime; //restart timer
                }

                return prev - 0.01;
            });
            
        }, 10);

        return () => clearInterval(timer);
    }, [gameEndBool]);

    //game duration timer
    useEffect(() => {

        if (gameEndBool) {
            return;
        }

        const gameTimer = setInterval(() => {
            setTotalGameTime((prev) => {

                if (prev - 0.01 <= 0.01) { //if game time out, make popup to rs game, display score
                    setGameEndBool(true);
                    
                }

                return prev - 0.01;
            });
            
        }, 10);

        return () => clearInterval(gameTimer);
    }, [gameEndBool]);

    return (
        <main className={styles.game}> {/* could create a var for background-color, since this and gameErrMsg must share bg color */}
            
            <div className={styles.gameEndPopUp} style={{zIndex: gameEndBool ? 10 : -1, visibility: gameEndBool ? "visible" : "hidden"}}></div>

            <p className={styles.gameTimer}>{totalGameTime.toFixed(1)}</p>

            <div className={styles.gameMidContainer}>

                <p className={styles.gameErrMsg} style={{color: errBool ? "#FFFFFF" : "#67c0c2"}}>{errMsg}</p>

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
                
                <button className={styles.gameWordResetButton} onClick={() => {getWord()}}>Reset Word</button>
            </div>
        </main>
    );
}