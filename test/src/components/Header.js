import PropTypes from 'prop-types';
import Button from './button';

const Header = (props) => {//remove the display nones
    return(
    <header>
        <h1 id="subtitle">{props.text}</h1>
        <Button/>
    </header>
    );
};

Header.defaultProps = {
    text: "for some reason I could not pick a random quote"
}

Header.propTypes = {
    text: PropTypes.string.isRequired
}

//const style = {
//    color: "pink", 
//    backgroundColor:"black",
//    display: "none"
//}

export default Header;
