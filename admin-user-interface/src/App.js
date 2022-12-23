import './App.css';
import MembersTable from './TableComponents/MembersTable';
import Header from './Components/header';

function App() {
  return (
    <div className="App">
      <Header />
      <div>
        <MembersTable />
      </div>
    </div>
  );
}

export default App;
