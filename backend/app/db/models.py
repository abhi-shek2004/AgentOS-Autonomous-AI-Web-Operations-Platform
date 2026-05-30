import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    goal = Column(String(512), nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    plan = Column(JSON, nullable=True)  # List of steps
    success_criteria = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    sessions = relationship("BrowserSession", back_populates="workflow", cascade="all, delete-orphan")


class BrowserSession(Base):
    __tablename__ = "browser_sessions"

    id = Column(String(100), primary_key=True, index=True)  # UUID string
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=True)
    status = Column(String(50), default="initializing")  # active, completed, crashed, healing
    current_url = Column(String(512), nullable=True)
    current_step_index = Column(Integer, default=0)
    total_steps = Column(Integer, default=0)
    token_usage = Column(JSON, default=lambda: {"prompt": 0, "completion": 0, "total": 0})
    cost_usd = Column(JSON, default=lambda: {"amount": 0.0})
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    workflow = relationship("Workflow", back_populates="sessions")
    logs = relationship("ExecutionLog", back_populates="session", cascade="all, delete-orphan")


class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), ForeignKey("browser_sessions.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    agent_name = Column(String(100), nullable=False)  # Planner, Navigator, Executor, Validator, Memory, Recovery, Supervisor
    level = Column(String(20), default="INFO")  # INFO, WARNING, ERROR, DEBUG
    message = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=True)
    action_taken = Column(JSON, nullable=True)  # details of click/type etc.
    screenshot = Column(Text, nullable=True)  # Base64 string or file path reference

    session = relationship("BrowserSession", back_populates="logs")


class MemoryIndex(Base):
    __tablename__ = "memory_index"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(255), index=True, nullable=False)
    goal_query = Column(String(512), nullable=False)
    successful_steps = Column(JSON, nullable=False)  # Action sequence that succeeded
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SecureCredential(Base):
    __tablename__ = "secure_credentials"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(255), index=True, unique=True, nullable=False)
    encrypted_username = Column(Text, nullable=False)
    encrypted_password = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
