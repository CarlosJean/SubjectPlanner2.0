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
  day: number;
  hourFrom: string;
  hourTo: string;

  constructor(day: number, hourFrom: string, hourTo: string) {
    this.day = Number(day);
    this.hourFrom = hourFrom;
    this.hourTo = hourTo;
  }
}

function App() {
  const [checkedOnes, setCheckedOnes] = useState<number[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [hourFrom, setHourFrom] = useState("");
  const [hourTo, setHourTo] = useState("");
  const [hours, setHours] = useState("");
  const [startDate, setStartDate] = useState("");

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

    console.log(hourFrom, hourTo);
    
    let newSchedules: Schedule[] = schedules.map(s => {
      return new Schedule([...s.days.filter(x => !checkedOnes.includes(x))], s.hourFrom, s.hourTo);
    });

    newSchedules = [
      ...newSchedules,
      new Schedule([...checkedOnes], `${hourFrom}:00`, `${hourTo}:00`)
    ]

    newSchedules = newSchedules.filter(n => n.days.length > 0);

    setSchedules(newSchedules);
  }

  useEffect(() => {
    console.log(schedules);
  }, [schedules]);

  const handleSendRequest = (): void => {
    //Aquí se debe formar y enviar la solicitud
    const scheduleRequest = schedules
      .flatMap(schedule =>
        schedule.days
          .map(day => new ScheduleRequest(day, schedule.hourFrom, schedule.hourTo)));

    const request:any = {
      hours: Number(hours),
      startDate,
      Schedules: scheduleRequest
    };

    console.log(request);
    getData(request);    
  }

async function getData(request:any) {
  const url = "http://localhost:5000/api/subjects";
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error:any) {
    console.error(error.message);
  }
}

  const handleOnTextChange = ({target}:any):void => {
    console.log(target);
    
    switch (target.id) {
      case "txTotalHours":
        setHours(target.value);
        break;
      case "txtHourFrom":
        setHourFrom(target.value);
        break;
      case "txtHourTo":
        setHourTo(target.value);
        break;
      case "txtStartDate":
        setStartDate(target.value);
        break;
    
      default:
        break;
    }
  }

  return (
    <>
      <label htmlFor="txTotalHours">Horas totales</label>
      <input type="text" name="" id="txTotalHours" onChange={handleOnTextChange}/>
      <label htmlFor="txtStartDate">Fecha de inicio</label>
      <input type="date" name="" id="txtStartDate" onChange={handleOnTextChange}/>
      <label htmlFor="txtHourFrom">Hora desde</label>
      <input type="time" name="" id="txtHourFrom" onChange={handleOnTextChange}/>
      <label htmlFor="txtHourTo">Hora hasta</label>
      <input type="time" name="" id="txtHourTo" onChange={handleOnTextChange}/>
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
