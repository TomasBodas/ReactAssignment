import DurationChart from './DurationChart';
import data2 from './json_data/ws.json';
import data1 from './json_data/tasks.json';

function App() {
  return (
    <div className="App">
      <DurationChart data1={data1} data2={data2.data} />
    </div>
  );
}

export default App;
