const vscode = require("vscode");
let isWriting = false;
let timer = null;
let currentIndex = 0;
function generateText(editor) {
  if (!isWriting || currentIndex >= templateText.length) return;

  let char = templateText[currentIndex];
  let delay = 200;
  let baseDelay = 200;

  if (templateText.slice(currentIndex, currentIndex + 4) === "    ") {
    char = "    ";
    baseDelay = 100;
  } else if (char === " ") {
    baseDelay = 400;
  } else if (char === "\n") {
    baseDelay = 700;
  }

  // Добавляем случайное отклонение ±100–150 мс
  const variation = Math.floor(Math.random() * 100) + 50; // от 50 до 149
  const sign = Math.random() < 0.5 ? -1 : 1; // плюс или минус
  delay = baseDelay + variation * sign;

  timer = setTimeout(() => {
    const position = editor.selection.end;

    editor
      .edit((editBuilder) => {
        editBuilder.insert(position, char);
      })
      .then(() => {
        currentIndex += char.length; // сдвигаемся сразу на 4, если вставили 4 пробела
        generateText(editor);
      });
  }, delay);
}

const templateText = `import sys; 
from PySide6.QtWidgets import QApplication,QMainWindow,QPushButton,QVBoxLayout,QWidget,QLineEdit,QTableWidget,QTableWidgetItem,QComboBox,QMessageBox,QHBoxLayout,QDialog,QFormLayout,QDialogButtonBox,QDateEdit,QLabel; 
from PySide6.QtCore import Qt,QDate; 
from PySide6.QtGui import QPixmap,QIcon; 
from sqlalchemy import create_engine,Column,Integer,String,Date,ForeignKey; 
from sqlalchemy.orm import declarative_base,sessionmaker,relationship

DB_URI = 'postgresql+psycopg2://postgres@localhost:5432/postgres'
engine = create_engine(DB_URI)
Session = sessionmaker(bind=engine)
Base = declarative_base()

class Company(Base):
    __tablename__ = 'companies'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    employees = relationship("Employee", back_populates="company")
    
class Position(Base):
    __tablename__ = 'positions'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    employees = relationship("Employee", back_populates="position")
    
class Employee(Base):
    __tablename__ = 'employees'
    id = Column(Integer, primary_key=True)
    full_name = Column(String)
    passport_series = Column(String)
    passport_number = Column(String)
    company_id = Column(Integer, ForeignKey('companies.id'))
    position_id = Column(Integer, ForeignKey('positions.id'))
    start_date = Column(Date)
    company = relationship("Company", back_populates="employees")
    position = relationship("Position", back_populates="employees")
    
Base.metadata.create_all(engine)

class EmployeeDialog(QDialog):
    def __init__(self, session, employee=None):
        super().__init__()
        self.setWindowTitle("Сотрудник")
        self.setWindowIcon(QIcon("logo.png"))
        self.session = session
        layout = QFormLayout()
        self.full_name = QLineEdit()
        self.passport_series = QLineEdit()
        self.passport_number = QLineEdit()
        self.company = QComboBox()
        self.position = QComboBox()
        self.start_date = QDateEdit(QDate.currentDate())
        companies = session.query(Company).all()
        positions = session.query(Position).all()
        self.company.addItems([''] + [c.name for c in companies])
        self.position.addItems([''] + [p.name for p in positions])
        if employee:
            self.full_name.setText(employee.full_name or '')
            self.passport_series.setText(employee.passport_series or '')
            self.passport_number.setText(employee.passport_number or '')
            self.company.setCurrentText(employee.company.name if employee.company else '')
            self.position.setCurrentText(employee.position.name if employee.position else '')
            self.start_date.setDate(employee.start_date)
            
        layout.addRow("ФИО:", self.full_name)
        layout.addRow("Серия:", self.passport_series)
        layout.addRow("Номер:", self.passport_number)
        layout.addRow("Компания:", self.company)
        layout.addRow("Должность:", self.position)
        layout.addRow("Дата:", self.start_date)
        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addRow(buttons)
        self.setLayout(layout)
        
    def get_data(self):
        c = self.session.query(Company).filter_by(name=self.company.currentText()).first()
        p = self.session.query(Position).filter_by(name=self.position.currentText()).first()
        return {'full_name': self.full_name.text(), 'passport_series': self.passport_series.text(),
                'passport_number': self.passport_number.text(), 'company': c, 'position': p,
                'start_date': self.start_date.date().toPython()}
        
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Сотрудники")
        self.setWindowIcon(QIcon("logo.png"))
        self.session = Session()
        layout = QVBoxLayout()
        logo = QLabel()
        logo.setPixmap(QPixmap("logo.png").scaled(100, 100, Qt.KeepAspectRatio))
        layout.addWidget(logo)
        role_layout = QHBoxLayout()
        self.role = QComboBox()
        self.role.addItems(["Админ", "Менеджер"])
        self.role.currentTextChanged.connect(self.update_buttons)
        role_layout.addWidget(QLabel("Роль:"))
        role_layout.addWidget(self.role)
        layout.addLayout(role_layout)
        search_layout = QHBoxLayout()
        self.search = QLineEdit()
        self.search.setPlaceholderText("Поиск по компании")
        self.search.textChanged.connect(self.load_data)
        self.filter = QComboBox()
        self.filter.currentTextChanged.connect(self.load_data)
        search_layout.addWidget(self.search)
        search_layout.addWidget(self.filter)
        layout.addLayout(search_layout)
        self.table = QTableWidget(0, 6)
        self.table.setHorizontalHeaderLabels(["ФИО", "Серия", "Номер", "Компания", "Должность", "Дата"])
        layout.addWidget(self.table)
        self.add_btn = QPushButton("Добавить")
        self.add_btn.clicked.connect(self.add_employee)
        layout.addWidget(self.add_btn)
        self.edit_btn = QPushButton("Редактировать")
        self.edit_btn.clicked.connect(self.edit_employee)
        layout.addWidget(self.edit_btn)
        self.delete_btn = QPushButton("Удалить")
        self.delete_btn.clicked.connect(self.delete_employee)
        layout.addWidget(self.delete_btn)
        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)
        self.load_filters()
        self.update_buttons()
        self.load_data()
        
    def load_filters(self):
        self.filter.clear()
        self.filter.addItem("Все")
        companies = self.session.query(Company).all()
        self.filter.addItems([c.name for c in companies])
        
    def load_data(self):
        employees = self.session.query(Employee)
        if self.search.text():
            employees = employees.join(Company).filter(Company.name.ilike(f"%{self.search.text()}%"))
        if self.filter.currentText() != "Все":
            employees = employees.join(Company).filter(Company.name == self.filter.currentText())
        employees = employees.all()
        self.table.setRowCount(len(employees))
        for i, e in enumerate(employees):
            self.table.setItem(i, 0, QTableWidgetItem(e.full_name or ''))
            self.table.setItem(i, 1, QTableWidgetItem(e.passport_series or ''))
            self.table.setItem(i, 2, QTableWidgetItem(e.passport_number or ''))
            self.table.setItem(i, 3, QTableWidgetItem(e.company.name if e.company else ''))
            self.table.setItem(i, 4, QTableWidgetItem(e.position.name if e.position else ''))
            self.table.setItem(i, 5, QTableWidgetItem(e.start_date.strftime("%Y-%m-%d") if e.start_date else ''))
            
    def add_employee(self):
        dialog = EmployeeDialog(self.session)
        if dialog.exec():
            employee = Employee(**dialog.get_data())
            self.session.add(employee)
            self.session.commit()
            self.load_data()
            
    def edit_employee(self):
        if self.table.currentRow() == -1: return QMessageBox.warning(self, "Ошибка", "Выберите")
        employee = self.session.query(Employee).filter_by(full_name=self.table.item(self.table.currentRow(), 0).text()).first()
        dialog = EmployeeDialog(self.session, employee)
        if dialog.exec():
            for k, v in dialog.get_data().items(): setattr(employee, k, v)
            self.session.commit()
            self.load_data()
            
    def delete_employee(self):
        if self.table.currentRow() == -1: return QMessageBox.warning(self, "Ошибка", "Выберите")
        name = self.table.item(self.table.currentRow(), 0).text()
        if QMessageBox.question(self, "Удалить", f"Удалить {name}?", QMessageBox.Yes | QMessageBox.No) == QMessageBox.Yes:
            employee = self.session.query(Employee).filter_by(full_name=name).first()
            self.session.delete(employee)
            self.session.commit()
            self.load_data()
            
    def update_buttons(self):
        is_admin = self.role.currentText() == "Админ"
        self.add_btn.setVisible(True)
        self.edit_btn.setVisible(is_admin)
        self.delete_btn.setVisible(is_admin)
        
    def closeEvent(self, event):
        self.session.close()
        event.accept()
        
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())`;
function activate(context) {
  console.log('Your extension "chatbot" is now active!');
  const start = vscode.commands.registerCommand(
    "extension.startWriting",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || isWriting) return;

      isWriting = true;
      generateText(editor, templateText);
    }
  );

  const stop = vscode.commands.registerCommand("extension.stopWriting", () => {
    isWriting = false;
    clearTimeout(timer);
  });
  const reset = vscode.commands.registerCommand(
    "extension.resetWriting",
    () => {
      isWriting = false;
      clearTimeout(timer);
      currentIndex = 0; // важно!
      vscode.window.showInformationMessage("Сброс выполнен.");
    }
  );

  context.subscriptions.push(start, stop, reset);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
