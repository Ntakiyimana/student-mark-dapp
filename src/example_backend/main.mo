import Nat "mo:base/Nat";
import Array "mo:base/Array";

actor StudentMarksRecord {

  type Student = {
    id: Nat;
    name: Text;
    email: Text;
    marks: Nat;
  };

  var students : [Student] = [];
  var nextId : Nat = 0;

  public query func getStudents() : async [Student] {
    return students;
  };

  public func addStudent(name: Text, email: Text, marks: Nat) : async () {
    let student = {
      id = nextId;
      name = name;
      email = email;
      marks = marks;
    };
    students := Array.append(students, [student]);
    nextId += 1;
  };

  public func updateStudent(id: Nat, name: Text, email: Text, marks: Nat) : async () {
    students := Array.map<Student, Student>(students, func (student: Student) : Student {
      if (student.id == id) {
        return {
          id = id;
          name = name;
          email = email;
          marks = marks;
        };
      };
      student;
    });
  };

  public func deleteStudent(id: Nat) : async () {
    students := Array.filter<Student>(students, func (student: Student) : Bool {
      student.id != id;
    });
  };
}
