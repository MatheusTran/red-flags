import './App.css';
import Header from './components/Header';
//https://www.npmjs.com/package/react-tinder-card

const subs = ["It's about to you fell in love", "Just give up and settle", "stop being picky and just choose one", "j;asghklfasa;wh", "time to fall in love", "Your best chance at marriage", "let's face it, you don't have any better options", "your mom really worries about you", "there's got to be at least one fish in the sea"]

function App() {
  return (
    <div className="container">
      <Header text={subs[Math.floor(Math.random()*subs.length)]}/>
    </div>
  );
}

export default App;
