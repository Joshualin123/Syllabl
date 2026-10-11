"use client"
import styles from "./game.module.css";
import {useState, useEffect} from 'react';

export default function Game() {

    const [time, setTime] = useState(10);
    const [totalTime, setTotalTime] = useState(10);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime((prev) => prev - 0.01);
        }, 10);

        return () => clearInterval(timer);
    }, []);

    return (
        <main className={styles.game}>
            <div className={styles.gameMidContainer}>
                <div className={styles.gameOldWordContainer}>e;lec;tro;phys;i;ol;o;gy</div>
                <div className={styles.gameBarTrack}>
                    <div className={styles.gameBar} style={{width: `${(time / totalTime) * 100}%`}}></div>
                </div>
                <input className={styles.gameNewWordContainer} placeholder="Enter word here..."></input>
            </div>
        </main>
    );
}