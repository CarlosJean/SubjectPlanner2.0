import { useEffect, useState } from "react";

class Schedule {
  days: number[];
  hourFrom: string;
  hourTo: string;

  constructor(days: number[], hourFrom: string, hourTo: string) {
    this.days = days;
    this.hourFrom = hourFrom;
    this.hourTo = hourTo;
  }
}

class ScheduleRequest {
  day:number;
  hourFrom:string;
  hourTo:string;

  constructor(day:number, hourFrom:string, hourTo:string) {
    this.day = day;
    this.hourFrom = hourFrom;
    this.hourTo = hourTo;
  }
}

function App() {
  const [checkedOnes, setCheckedOnes] = useState<number[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  function handleOnCheckBoxClick({ target }: any): void {

    if (target.checked) {
      setCheckedOnes([
        ...checkedOnes,
        target.value
      ]);
    } else {
      setCheckedOnes([
        ...checkedOnes.filter(c => c != target.value)
      ]);
    }
  }

  const handleOnClick = () => {
    let newSchedules: Schedule[] = schedules.map(s => {
      return new Schedule([...s.days.filter(x => !checkedOnes.includes(x))], s.hourFrom, s.hourTo);
    });

    newSchedules = [
      ...newSchedules,
      new Schedule([...checkedOnes], "", "")
    ]

    newSchedules = newSchedules.filter(n => n.days.length > 0);

    setSchedules(newSchedules);
  }

  useEffect(() => {
    console.log(schedules);
  }, [schedules]);

  const handleSendRequest = (): void => {
    //Aquí se debe formar y enviar la solicitud
    const request = schedules
      .map(schedule => 
        schedule.days
          .map(day => new ScheduleRequest(day, schedule.hourFrom, schedule.hourTo)));
          
    console.log(request);    
  }

  return (
    <>
      <>
        <label htmlFor="1">L</label>
        <input
          id="1"
          onClick={handleOnCheckBoxClick}
          type="checkbox"
          value={1}
        />
        <label htmlFor="2">M</label>
        <input
          id="2"
          onClick={handleOnCheckBoxClick}
          type="checkbox"
          value={2}
        />
        <label htmlFor="3">X</label>
        <input
          id="3"
          onClick={handleOnCheckBoxClick}
          type="checkbox"
          value={3}
        />
        <label htmlFor="4">J</label>
        <input
          id="4"
          onClick={handleOnCheckBoxClick}
          type="checkbox"
          value={4}
        />
        <label htmlFor="5">V</label>
        <input
          id="5"
          onClick={handleOnCheckBoxClick}
          type="checkbox"
          value={5}
        />
        <label htmlFor="6">S</label>
        <input
          id="6"
          onClick={handleOnCheckBoxClick}
          type="checkbox"
          value={6}
        />
        <label htmlFor="7">D</label>
        <input
          id="7"
          onClick={handleOnCheckBoxClick}
          type="checkbox"
          value={0}
        />
      </>
      <button
        type="button"
        onClick={handleOnClick}
      >
        Añadir
      </button>
      
      <button
        type="button"
        onClick={handleSendRequest}
      >
        Enviar soliciutd
      </button>
    </>
  )
}

export default App
