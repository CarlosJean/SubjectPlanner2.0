import { Button, Card, Checkbox, Col, DatePicker, Flex, InputNumber, Row, TimePicker } from "antd";
import { useState } from "react";

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

class Holiday {
  description: string;
  date: string;
  constructor(description: string, date: string) {
    this.description = description;
    this.date = date;
  }
}

class CalculationResult {
  endDate: string;
  classDays: number;
  holidays: Holiday[];

  constructor(endDate: string, classDays: number, holidays: Holiday[]) {
    this.endDate = endDate;
    this.classDays = classDays;
    this.holidays = holidays
  }
}

function App() {
  const [checkedOnes, setCheckedOnes] = useState<number[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [hourFrom, setHourFrom] = useState("");
  const [hourTo, setHourTo] = useState("");
  const [hours, setHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [calculationResult, setCalculationResult] = useState<CalculationResult>(new CalculationResult("", 0, []));

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
      new Schedule([...checkedOnes], `${hourFrom}:00`, `${hourTo}:00`)
    ]

    newSchedules = newSchedules.filter(n => n.days.length > 0);

    setSchedules(newSchedules);
  }

  const handleSendRequest = async (): Promise<void> => {
    //Aquí se debe formar y enviar la solicitud
    const scheduleRequest = schedules
      .flatMap(schedule =>
        schedule.days
          .map(day => new ScheduleRequest(day, schedule.hourFrom, schedule.hourTo)));

    const request: any = {
      hours: Number(hours),
      startDate,
      Schedules: scheduleRequest
    };

    setCalculationResult(await getData(request));
  }


  const getData = async (request: any) => {
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

      return await response.json();
    } catch (error: any) {
      console.error(error.message);
    }
  }

  const handleOnTextChange = ({ target }: any): void => {
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

  const handleOnRemoveSchedule = (scheduleIndex: number): void => {
    setSchedules(
      schedules
        .filter((_, index) => index != scheduleIndex)
    );
  }

  return (
    <>
      <Flex gap={"small"} justify="space-around" style={{ marginLeft: "5%", marginRight: "5%" }} wrap vertical>
        <Card title="Información de la materia">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <label htmlFor="txTotalHours">Horas totales</label>
                  <InputNumber min={1} id="txTotalHours" onChange={handleOnTextChange} style={{ width: "100%" }}></InputNumber>
                </Col>
                <Col xs={24} sm={12}>
                  <label htmlFor="txtStartDate">Fecha de inicio</label>
                  <DatePicker id="txtStartDate" onChange={handleOnTextChange} style={{ width: "100%" }}></DatePicker>
                </Col>
                <Col>
                  <ul>
                    {schedules
                      .map((schedule, index) =>
                      (<li key={index}>
                        <p>{schedule.days.join(",")}</p>
                        <p>{schedule.hourFrom} - {schedule.hourTo} <button onClick={() => handleOnRemoveSchedule(index)}>-</button></p>
                      </li>))
                    }
                  </ul>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={12}>
              <Row gutter={16}>
                <Col span={24}>
                  <Checkbox
                    id="1"
                    onClick={handleOnCheckBoxClick}
                    type="checkbox"
                    value={1}>
                    L
                  </Checkbox>
                  <Checkbox
                    id="2"
                    onClick={handleOnCheckBoxClick}
                    type="checkbox"
                    value={2}>
                    M
                  </Checkbox>
                  <Checkbox
                    id="3"
                    onClick={handleOnCheckBoxClick}
                    type="checkbox"
                    value={3}>
                    X
                  </Checkbox>
                  <Checkbox
                    id="4"
                    onClick={handleOnCheckBoxClick}
                    type="checkbox"
                    value={4}>
                    J
                  </Checkbox>
                  <Checkbox
                    id="5"
                    onClick={handleOnCheckBoxClick}
                    type="checkbox"
                    value={5}>
                    V
                  </Checkbox>
                  <Checkbox
                    id="6"
                    onClick={handleOnCheckBoxClick}
                    type="checkbox"
                    value={6}>
                    S
                  </Checkbox>
                  <Checkbox
                    id="0"
                    onClick={handleOnCheckBoxClick}
                    type="checkbox"
                    value={0}>
                    D
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <label htmlFor="txtHourFrom">Hora desde</label>
                  <TimePicker mode="time" id="txtHourFrom" onChange={handleOnTextChange}></TimePicker>
                </Col>
                <Col span={8}>
                  <label htmlFor="txtHourTo">Hora hasta</label>
                  <TimePicker mode="time" id="txtHourTo" onChange={handleOnTextChange}></TimePicker>
                </Col>
                <Col span={8}>
                  <Flex align="start" justify="end" style={{ height: "100%" }} vertical>
                    <Button
                      type="default"
                      onClick={handleOnClick}
                    >
                      Añadir
                    </Button>
                  </Flex>
                </Col>
              </Row>
            </Col>
            <Col xs={24}>
              <Button
                type="primary"
                onClick={handleSendRequest}
                style={{width: "100%"}}
              >
                Obtener resultados
              </Button>
            </Col>
          </Row>
        </Card>

        <Card title="Resultados">
          <Row>
            <Col>
              <p>
                Fecha de finalización <strong>{calculationResult.endDate}</strong>
              </p>
            </Col>
          </Row>
          <p>
            Días de clases <strong>{calculationResult.classDays}</strong>
          </p>

          <p>Feriados</p>
          <ul>
            {(calculationResult.holidays.length === 0 && calculationResult.classDays > 0 && <p>No hay feriados que afecten.</p>)}
            {calculationResult
              .holidays
              .map((holiday, index) => (<li key={index}>{holiday.date}</li>))}
          </ul>
        </Card>
      </Flex>
    </>
  )
}

export default App