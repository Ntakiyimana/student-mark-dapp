import React, { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { example_backend } from 'declarations/example_backend';
import './index.scss';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [students, setStudents] = useState([]);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [showUpdateStudentForm, setShowUpdateStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', marks: '' });
  const [currentStudent, setCurrentStudent] = useState(null);
  
  useEffect(() => {
    const checkLoginStatus = async () => {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();
      setIsLoggedIn(isAuthenticated);
      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        updateIdentity(identity);
      }
    };

    checkLoginStatus();
  }, []);

  const signIn = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: process.env.NODE_ENV === 'production'
        ? undefined
        : `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`,
    });
    const identity = authClient.getIdentity();
    updateIdentity(identity);
    setIsLoggedIn(true);
  };

  const signOut = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    updateIdentity(null);
  };

  const updateIdentity = (identity) => {
    if (identity) {
      setPrincipal(identity.getPrincipal().toText());
      const agent = new HttpAgent({ identity });
      const actor = Actor.createActor(example_backend.idlFactory, {
        agent,
        canisterId: example_backend.canisterId,
      });
      example_backend.setActor(actor);
    } else {
      setPrincipal(null);
      example_backend.setActor(null);
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsList = await example_backend.getStudents();
      setStudents(studentsList);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();
    try {
      await example_backend.addStudent(newStudent.name, newStudent.email, parseInt(newStudent.marks));
      setNewStudent({ name: '', email: '', marks: '' });
      setShowAddStudentForm(false);
      fetchStudents();
    } catch (error) {
      console.error("Failed to add student:", error);
    }
  };

  const handleUpdateStudent = async (event) => {
    event.preventDefault();
    try {
      await example_backend.updateStudent(currentStudent.id, currentStudent.name, currentStudent.email, parseInt(currentStudent.marks));
      setCurrentStudent(null);
      setShowUpdateStudentForm(false);
      fetchStudents();
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await example_backend.deleteStudent(studentId);
      fetchStudents();
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  const handleViewStudents = () => {
    fetchStudents();
    setShowAddStudentForm(false);
    setShowUpdateStudentForm(false);
  };

  const handleEditStudent = (student) => {
    setCurrentStudent(student);
    setShowUpdateStudentForm(true);
    setShowAddStudentForm(false);
  };

  return (
    <main>
      <h1>Student Marks Record System</h1>
      {isLoggedIn ? (
        <>
          <p>Welcome back, {principal || "User"}!</p>
          <button onClick={signOut}>Sign Out</button>
          <button onClick={() => setShowAddStudentForm(true)}>Add New Student</button>
          <button onClick={handleViewStudents}>View Students</button>
          <h2>Student List</h2>
          {!showAddStudentForm && !showUpdateStudentForm && (
            <ul>
              {students.map((student, index) => (
                <li key={index}>
                  {student.name} - {student.email} - {student.marks}
                  <button onClick={() => handleEditStudent(student)}>Edit</button>
                  <button onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
          {showAddStudentForm && (
            <form onSubmit={handleAddStudent}>
              <label>
                Name:
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  required
                />
              </label>
              <label>
                Marks:
                <input
                  type="number"
                  value={newStudent.marks}
                  onChange={(e) => setNewStudent({ ...newStudent, marks: e.target.value })}
                  required
                />
              </label>
              <button type="submit">Save Student</button>
            </form>
          )}
          {showUpdateStudentForm && currentStudent && (
            <form onSubmit={handleUpdateStudent}>
              <label>
                Name:
                <input
                  type="text"
                  value={currentStudent.name}
                  onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={currentStudent.email}
                  onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })}
                  required
                />
              </label>
              <label>
                Marks:
                <input
                  type="number"
                  value={currentStudent.marks}
                  onChange={(e) => setCurrentStudent({ ...currentStudent, marks: e.target.value })}
                  required
                />
              </label>
              <button type="submit">Update Student</button>
            </form>
          )}
        </>
      ) : (
        <button onClick={signIn}>Sign In</button>
      )}
    </main>
  );
}

export default App;
