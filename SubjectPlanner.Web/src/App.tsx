import { Button, Card, Checkbox, Col, DatePicker, Flex, InputNumber, message, Row, TimePicker } from "antd";
import { useState } from "react";
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importa los datos del idioma español

const baseUrl:string = import.meta.env.VITE_API_BASE_URL;

class Schedule {
  days: number[];
  hourFrom: string;
  hourTo: string;

  constructor(days: number[], hourFrom: string, hourTo: string) {
    this.days = days;
    this.hourFrom = dayjs(hourFrom, "HH:mm").format('HH:mm');
    this.hourTo = dayjs(hourTo, "HH:mm").format('HH:mm');
  }
}

class ScheduleRequest {
  day: number;
  hourFrom: string;
  hourTo: string;

  constructor(day: number, hourFrom: string, hourTo: string) {
    this.day = Number(day);
    this.hourFrom = dayjs(hourFrom, 'HH:mm').format("HH:mm:ss").toString();
    this.hourTo = dayjs(hourTo, 'HH:mm').format("HH:mm:ss").toString();
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
  const [timeRange, setTimeRange] = useState<any>([]);
  const [hours, setHours] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [calculationResult, setCalculationResult] = useState<CalculationResult>(new CalculationResult("01/01/0001 00:00:00", 0, []));
  const [loadingResults, setLoadingResults] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  function handleOnCheckBoxClick(value: number, { target }: any): void {
    if (target.checked) {
      setCheckedOnes([
        ...checkedOnes,
        value
      ]);
    } else {
      setCheckedOnes([
        ...checkedOnes.filter(c => c != value)
      ]);
    }
  }

  const handleOnClick = () => {
    let newSchedules: Schedule[] = schedules.map(s => {
      return new Schedule([...s.days.filter(x => !checkedOnes.includes(x))], s.hourFrom, s.hourTo);
    });

    newSchedules = [
      ...newSchedules,
      new Schedule([...checkedOnes], timeRange[0], timeRange[1])
    ]

    newSchedules = newSchedules.filter(n => n.days.length > 0);

    setSchedules(newSchedules);
  }

  const handleSendRequest = async (): Promise<void> => {
    setLoadingResults(false);

    setInterval(() => {
      setLoadingResults(true);
    }, .01);

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
    const url = `${baseUrl}/api/subjects`;
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        messageApi.open({
          type: "error",
          content: "Ocurrio un error durante la operación."
        })
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      messageApi.open({
        type: "error",
        content: "Ocurrio un error durante la operación."
      });
    }
  }

  const handleOnTextChange = (totalHours: any): void => {
    setHours(totalHours);
  }

  const handleOnDateChange = (date: any): void => {
    if (date == null) { return }

    setStartDate(date);
  }

  const handleOnRemoveSchedule = (scheduleIndex: number): void => {
    setSchedules(
      schedules
        .filter((_, index) => index != scheduleIndex)
    );
  }

  const getFormattedSchedule = (days: number[]): string => {
    dayjs.locale("es");

    return days.map(day => dayjs().day(day).format('dd')).join(', ')
  };

  const handleCleanScheduleForm = () => {
    setCheckedOnes([]);
    setTimeRange(null);
  }

  const handleOnTimePickerChange = (dates: any) => {
    if (dates == null) { setTimeRange([null, null]); return; }

    const [hourFrom, hourTo] = dates;

    setTimeRange([
      hourFrom,
      hourTo
    ]);
  }

  const handleOnClickClearAll = (): void => {
    handleCleanScheduleForm();
    setHours(0);
    setSchedules([]);
    setStartDate("");
    setCalculationResult({ ...calculationResult, classDays: 0 })
  }

  return (
    <>
      {contextHolder}
      <Flex gap={"small"} justify="space-around" style={{ marginLeft: "10%", marginRight: "10%" }} wrap vertical>
        <Card title="Información de la materia">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <label htmlFor="txTotalHours">Horas totales</label>
                  <InputNumber
                    min={1}
                    id="txTotalHours"
                    onChange={(totalHours) => handleOnTextChange(totalHours)}
                    style={{ width: "100%" }}
                    value={hours}>
                  </InputNumber>
                </Col>
                <Col xs={24} sm={12}>
                  <label htmlFor="txtStartDate">Fecha de inicio</label>
                  <DatePicker
                    id="txtStartDate"
                    onChange={handleOnDateChange}
                    style={{ width: "100%" }}
                    placeholder="Seleccione una fecha"
                    format={"DD/MM/YYYY"}
                    value={startDate}>
                  </DatePicker>
                </Col>
                <Col span={24}>
                  <Row gutter={16}>
                    {schedules
                      .map((schedule, index) =>
                      (<Col span={8} key={index}>
                        <Card title={getFormattedSchedule(schedule.days)}>
                          <Row gutter={16}>
                            <Col span={24}>{schedule.hourFrom} - {schedule.hourTo}</Col>
                            <Col span={24}>
                              <Button color="danger" variant="dashed" onClick={() => handleOnRemoveSchedule(index)} style={{ width: "100%" }}>-</Button>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                      ))
                    }
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={12}>
              <Row gutter={16}>
                <Col span={3}>
                  <Checkbox
                    id="1"
                    onChange={(e) => handleOnCheckBoxClick(1, e)}
                    type="checkbox"
                    checked={checkedOnes.some((item) => item === 1)}>
                    L
                  </Checkbox>
                </Col>
                <Col span={3}>
                  <Checkbox
                    id="2"
                    onChange={(e) => handleOnCheckBoxClick(2, e)}
                    type="checkbox"
                    checked={checkedOnes.some((item) => item === 2)}>
                    M
                  </Checkbox>
                </Col>
                <Col span={3}>
                  <Checkbox
                    id="3"
                    onChange={(e) => handleOnCheckBoxClick(3, e)}
                    type="checkbox"
                    checked={checkedOnes.some((item) => item === 3)}>
                    X
                  </Checkbox>
                </Col>
                <Col span={3}>
                  <Checkbox
                    id="4"
                    onChange={(e) => handleOnCheckBoxClick(4, e)}
                    type="checkbox"
                    checked={checkedOnes.some((item) => item === 4)}>
                    J
                  </Checkbox>
                </Col>
                <Col span={3}>
                  <Checkbox
                    id="5"
                    onChange={(e) => handleOnCheckBoxClick(5, e)}
                    type="checkbox"
                    checked={checkedOnes.some((item) => item === 5)}>
                    V
                  </Checkbox>
                </Col>
                <Col span={3}>
                  <Checkbox
                    id="6"
                    onChange={(e) => handleOnCheckBoxClick(6, e)}
                    type="checkbox"
                    checked={checkedOnes.some((item) => item === 6)}>
                    S
                  </Checkbox>
                </Col>
                <Col span={3}>
                  <Checkbox
                    id="0"
                    onChange={(e) => handleOnCheckBoxClick(0, e)}
                    type="checkbox"
                    checked={checkedOnes.some((item) => item === 0)}>
                    D
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <TimePicker.RangePicker
                    format={"HH:mm"}
                    onChange={handleOnTimePickerChange}
                    placeholder={["Hora de inicio", "Hora de finalización"]}
                    value={timeRange}
                    style={{ width: "100%" }}
                  >
                  </TimePicker.RangePicker>
                </Col>
                <Col span={24}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Button
                        type="default"
                        onClick={handleCleanScheduleForm}
                        style={{ width: "100%" }}
                      >
                        Limpiar
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button
                        type="default"
                        onClick={handleOnClick}
                        style={{ width: "100%" }}
                      >
                        Añadir
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xs={24}>
              <Row gutter={24}>
                <Col span={24}>
                  <Button
                    onClick={handleOnClickClearAll}
                    style={{ width: "100%" }}
                  >
                    Limpiar todo
                  </Button>
                </Col>
                <Col span={24}>
                  <Button
                    type="primary"
                    onClick={handleSendRequest}
                    style={{ width: "100%" }}
                  >
                    Obtener resultados
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row >
        </Card >
        {
          (calculationResult.classDays > 0) &&
          <Card title="Resultados" className={(loadingResults) ? "loading" : ""}>
            <Row>
              <Col>
                <p>
                  Fecha de finalización <strong>{dayjs(calculationResult.endDate).format("DD/MM/YYYY HH:mm:ss")}</strong>
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
        }
      </Flex >
    </>
  )
}

export default App