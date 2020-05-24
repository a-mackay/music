import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Album, albumsByArtist} from './Albums';

const MIN_FONT_SIZE = 1; // 1em
const MAX_FONT_SIZE = 15; // 15em

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
            <VerticalBarChart yearAndMinsArray={yearAndMinsArray()} />
            <Artists artistAndMinsArray={artistAndMinsArray()} />
        </div>
    );
}

interface ArtistsProps {
    artistAndMinsArray: Array<ArtistAndMins>;
}

function Artists({artistAndMinsArray}: ArtistsProps) {
    const maxMins = artistAndMinsArray
        .map(({totalMinutes}) => totalMinutes)
        .reduce((a, b) => Math.max(a, b));

    return <div>
        {artistAndMinsArray.map(({artist, totalMinutes}) => {
            const fontSize = (totalMinutes / maxMins) * (MAX_FONT_SIZE - MIN_FONT_SIZE) + MIN_FONT_SIZE;
            const fontSizeEm = fontSize.toFixed(3) + "em";
            return <div style={{fontSize: fontSizeEm}}>{artist}</div>
        })}
    </div>
}

interface ArtistAndMins {
    artist: string;
    totalMinutes: number;
}

function artistAndMinsArray(): Array<ArtistAndMins> {
    const artistAndMins = Array.from(albumsByArtist().entries()).map(entry => {
        const artist = entry[0];
        const albums = entry[1];
        const totalSecs = albums
            .map(album => album.totalDurationInSeconds)
            .reduce((a, b) => a + b);
        const totalMinutes = secondsToMinutes(totalSecs);
        return {
            artist,
            totalMinutes,
        }
    });

    const compareByArtist = (a: ArtistAndMins, b: ArtistAndMins) => {
        if (a.artist < b.artist) {
            return -1;
        } else if (a.artist > b.artist) {
            return 1;
        } else {
            return 0;
        }
    };

    artistAndMins.sort(compareByArtist);

    return artistAndMins;
}

interface YearAndMins {
  year: number;
  totalMinutes: number;
}

function secondsToMinutes(seconds: number): number {
    return Math.round(seconds / 60);
}

function yearAndMinsArray(): Array<YearAndMins> {
    const albums = Array.from(albumsByArtist().entries()).flatMap(entry => entry[1]);
    const yearToTotalSeconds: Map<number, number> = new Map();
    for (const album of albums) {
        const year = album.year;
        const albumSecs = album.totalDurationInSeconds;

        let totalSecs = yearToTotalSeconds.get(year);
        totalSecs = (totalSecs === undefined) ? 0 : totalSecs;
        yearToTotalSeconds.set(year, totalSecs + albumSecs);
    };

    const minsPerYear = Array.from(yearToTotalSeconds.entries()).map(entry => ({
      year: entry[0],
      totalMinutes: secondsToMinutes(entry[1]),
    }));

    const compareByYear = (a: YearAndMins, b: YearAndMins) => {
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

interface VerticalBarChartProps {
  yearAndMinsArray: Array<YearAndMins>;
}

function VerticalBarChart({yearAndMinsArray}: VerticalBarChartProps) {
    const years = yearAndMinsArray.map(entry => entry.year);
    const minutes = yearAndMinsArray.map(entry => entry.totalMinutes);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const maxMinutes = Math.max(...minutes);

    function getMins(year: number) {
        const matchingEntry = yearAndMinsArray.find(entry => entry.year === year);
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
                {percentages.map(entry => <VerticalBarItem label={entry.year.toString()} percentage={entry.percentage}/>)}
                <div className="vertical-bar-spacer-item"/>
            </div>
        </div>
    );
}

interface VerticalBarItemProps {
  label: string;
  percentage: number;
}

function VerticalBarItem({label, percentage}: VerticalBarItemProps) {
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
