import React from 'react';
import logo from './logo.svg';
import './App.css';
import {albumsByArtist} from './Albums.js';

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

    function getMins(year) {
        const matchingEntry = minsPerYear.find(entry => parseInt(entry.year) === year);
        if (matchingEntry === undefined) {
            return 0;
        } else {
            return Math.round(matchingEntry.totalMinutes / maxMinutes * 100);
        }
    }

    const percentages = [];
    for (let year = minYear; year <= maxYear; year++) {
        percentages.push({
            year: year,
            percentage: getMins(year),
        })
    };

    return (
        <div className="vertical-bar-chart-container">
            <div className="vertical-bar-chart">
                <div className="vertical-bar-spacer-item"/>
                {percentages.map(entry => <VerticalBarItem label={entry.year} percentage={entry.percentage}/>)}
                <div className="vertical-bar-spacer-item"/>
            </div>
        </div>
    );
}

function VerticalBarItem({label, percentage}) {
    const style = {
        height: percentage.toString() + "%",
    };

    return (
        <div className="vertical-bar-item">
            <div className="vertical-bar-container">
                <div className="vertical-bar" style={style}></div>
            </div>
            <div className="vertical-bar-label-container">
                <p className="vertical-bar-label">{label}</p>
            </div>
        </div>
    );
}

export default App;
