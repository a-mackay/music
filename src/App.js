import React from 'react';
import logo from './logo.svg';
import './App.css';
import {albumsByArtist} from './Albums.js';

// console.log(minutesPerYear());

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
            <VerticalBarChart minsPerYear={minutesPerYear()} />
        </div>
    );
}

function minutesPerYear() {
    const albums = Object.values(albumsByArtist()).flatMap(albumList => albumList);
    const secsPerYear = {};
    for (const album of albums) {
        const year = album.year;
        const secs = album.totalDurationInSeconds;
        const currentTotalSecs = secsPerYear[year];
        if (currentTotalSecs === undefined) {
            secsPerYear[year] = secs;
        } else {
            secsPerYear[year] = currentTotalSecs + secs;
        };
    };

    const minsPerYear = [];
    for (const [year, totalSecs] of Object.entries(secsPerYear)) {
        minsPerYear.push({
            year: year,
            totalMinutes: Math.round(totalSecs / 60),
        });
    };

    const compareByYear = (a, b) => {
        if (a.year < b.year) {
            return -1;
        } else if (a.year > b.year) {
            return 1;
        } else {
            return 0;
        }
    };

    minsPerYear.sort(compareByYear);
    return minsPerYear;
}

function VerticalBarChart({minsPerYear}) {
    const years = minsPerYear.map(entry => parseInt(entry.year));
    const minutes = minsPerYear.map(entry => entry.totalMinutes);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const maxMinutes = Math.max(...minutes);

    const percentages = [];
    for (let year = minYear; year <= maxYear; year++) {
        percentages.push({
            year: year,
            percentage: Math.round(minsPerYear[year] / maxMinutes * 100),
        })
    };

    return (
        <div className="vertical-bar-chart">
            {percentages.map(entry => <VerticalBar label={entry.year} percentage={entry.percentage}/>)}
        </div>
    );
}

function VerticalBar({label, percentage}) {
    const style = {
        width: percentage.toString() + "%",
    };

    return (
        <div className="vertical-bar-item">
            <div className="vertical-bar"></div>
            <div className="vertical-bar-label">{label}</div>
        </div>
    );
}

export default App;
