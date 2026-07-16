namespace SubjectPlanner.Core.Exceptions;

[System.Serializable]
public class WrongScheduleException : System.Exception
{
    public WrongScheduleException() { }
    public WrongScheduleException(string message) : base(message) { }
    public WrongScheduleException(string message, System.Exception inner) : base(message, inner) { }
    protected WrongScheduleException(
        System.Runtime.Serialization.SerializationInfo info,
        System.Runtime.Serialization.StreamingContext context) : base(info, context) { }
}