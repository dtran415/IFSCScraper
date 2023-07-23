import React from "react";
import "./NavBar.css";
import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavItem } from "reactstrap";

function NavBar() {
  return (
    <div>
      <Navbar expand="md" className="fixed-top">
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink className="nav-item" to="/events">Events</NavLink>
            <NavLink className="nav-item" to="/athletes">Athletes</NavLink>
          </NavItem>
        </Nav>
      </Navbar>
    </div>
  );
}

export default NavBar;
