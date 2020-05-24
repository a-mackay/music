import React from 'react';
import logo from './logo.svg';
import './App.css';
import {albumsByArtist} from './Albums';

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
        </div>
    );
}

interface YearAndMins {
  year: number;
  totalMinutes: number;
};

function yearAndMinsArray(): Array<YearAndMins> {
    const albums = Object.values(albumsByArtist()).flatMap(albumList => albumList);
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
      totalMinutes: Math.round(entry[1] / 60),
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


// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
