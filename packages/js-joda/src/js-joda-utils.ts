import {
  Period,
  Duration,
  ZoneId,
  IsoFields,
  LocalDateTime,
  LocalDate,
  LocalTime,
  ZonedDateTime,
  DateTimeParseException,
  DateTimeFormatter,
  Instant,
  ZoneOffset
} from "@js-joda/core";
import { IUtils } from "@date-io/core/IUtils";

function assumeType<T>(x: unknown): asserts x is T {
  return;
}

// v2.0.0
//
// interface Opts {
//   locale?: any;
//   formats?: Partial<DateIOFormats>;
// }
//
// const defaultFormats: DateIOFormats = {
//   fullDate: "yyyy, MMMM d",
//   normalDate: "ddd, MMM d",
//   shortDate: "MMM d",
//   monthAndDate: "MMMM d",
//   dayOfMonth: "d",
//   year: "yyyy",
//   month: "MMMM",
//   monthShort: "MMM",
//   monthAndYear: "MMMM yyyy",
//   minutes: "mm",
//   hours12h: "hh",
//   hours24h: "HH",
//   seconds: "ss",
//   fullTime12h: "hh:mm a",
//   fullTime24h: "HH:mm",
//   fullDateTime12h: "yyyy, MMM d hh:mm a",
//   fullDateTime24h: "yyyy, MMM d HH:mm",
//   keyboardDate: "yyyy/MM/dd",
//   keyboardDateTime12h: "yyyy/MM/dd hh:mm a",
//   keyboardDateTime24h: "yyyy/MM/dd HH:mm"
// };

type DateType<A> = A | Error;
type CalendarType = LocalDateTime | LocalDate;
type Temporal = LocalDateTime | LocalDate | LocalTime;
type TConst = typeof LocalDateTime | typeof LocalDate | typeof LocalTime;

export default function JsJodaUtilsConstructor(temporalType: TConst): any {
  return class JsJodaUtils implements IUtils<DateType<Temporal>> {
    public locale?: any;

    constructor({ locale } = { locale: undefined }) {
      if (locale) {
        this.locale = locale;
      }
    }

    public yearFormat = "yyyy";

    public yearMonthFormat = "MMMM yyyy";

    public dateTime12hFormat = "MMMM d hh:mm a";

    public dateTime24hFormat = "MMMM d HH:mm";

    public time12hFormat = "hh:mm a";

    public time24hFormat = "HH:mm";

    public dateFormat = "MMMM d";

    // @Deprecated
    public getCalendarHeaderText(date: DateType<Temporal>) {
      if (date instanceof Error) {
        throw date;
      }
      let formatter = DateTimeFormatter.ofPattern(this.yearMonthFormat).withLocale(
        this.locale
      );
      return date.format(formatter);
    }

    public getYearText(date: DateType<Temporal>) {
      if (date instanceof Error) {
        throw date;
      }
      let formatter = DateTimeFormatter.ofPattern(this.yearFormat).withLocale(
        this.locale
      );
      return date.format(formatter);
    }

    public getDatePickerHeaderText(date: DateType<Temporal>) {
      if (date instanceof Error) {
        throw date;
      }
      let formatter = DateTimeFormatter.ofPattern("EEE, MMM d").withLocale(this.locale);
      return date.format(formatter);
    }

    public getDateTimePickerHeaderText(date: DateType<Temporal>) {
      if (date instanceof Error) {
        throw date;
      }
      return this.format(date, "MMM d");
    }

    public getMonthText(date: DateType<Temporal>) {
      if (date instanceof Error) {
        throw date;
      }
      return this.format(date, "MMMM");
    }

    public getDayText(date: DateType<Temporal>) {
      if (date instanceof Error) {
        throw date;
      }
      return this.format(date, "d");
    }

    public getHourText(date: DateType<Temporal>, ampm: boolean) {
      if (date instanceof Error) {
        throw date;
      }
      return this.format(date, ampm ? "hh" : "HH");
    }

    public getMinuteText(date: DateType<Temporal>) {
      if (date instanceof Error) {
        throw date;
      }
      return this.format(date, "mm");
    }

    public getSecondText(date: DateType<Temporal>) {
      if (date instanceof Error) {
        throw date;
      }
      return this.format(date, "ss");
    }
    // EOF @Deprecated

    public parse(value: string, format: string): DateType<Temporal> | null {
      if (value === "") {
        return null;
      }

      let formatter = DateTimeFormatter.ofPattern(format).withLocale(this.locale);

      try {
        return temporalType.parse(value, formatter);
      } catch (ex) {
        if (ex instanceof DateTimeParseException) {
          return ex;
        }
        throw ex;
      }
    }

    public date(value?: any): DateType<Temporal> | null {
      if (value === null) {
        return null;
      }

      if (typeof value === "undefined") {
        return temporalType.now();
      }

      if (typeof value === "string") {
        const date = new Date(value);
        if (isNaN(date.valueOf())) {
          return null;
        }
        const instant = Instant.ofEpochMilli(date.valueOf());
        const localDateTime = temporalType.ofInstant(instant, ZoneId.systemDefault());
        return localDateTime;
      }

      if (
        value instanceof LocalDateTime ||
        value instanceof LocalTime ||
        value instanceof LocalDate
      ) {
        return value;
      }

      if (value instanceof Error) {
        return value;
      }

      if (value instanceof Date) {
        const instant = Instant.ofEpochMilli(value.valueOf());
        return temporalType.ofInstant(instant, ZoneId.systemDefault());
      }

      throw new Error(`Unknown Date value in function date(): ${value}`);
    }

    public isNull(date: DateType<Temporal> | null): boolean {
      return date === null;
    }

    public isValid(value: any): boolean {
      if (value instanceof Error) {
        return false;
      }

      if (value === null) {
        return false;
      }

      if (typeof value === "undefined") {
        return true;
      }

      if (value instanceof Date) {
        return !isNaN(value.valueOf());
      }

      if (typeof value === "string") {
        return !isNaN(new Date(value).valueOf());
      }

      if (value instanceof temporalType) {
        return true;
      }

      throw new Error(`Unknown Date value in function isValid(): ${value}`);
    }

    public getDiff(value: any, comparing: any): number {
      const first = this.date(comparing);
      const second = this.date(value);
      if (first instanceof Error || second instanceof Error) {
        throw first instanceof Error ? first : second;
      }
      const duration = Duration.between(first, second);
      return duration.toMillis();
    }

    public isEqual(value: any, comparing: any): boolean {
      const first = this.date(value);
      const second = this.date(comparing);
      if (first === null && second === null) {
        return true;
      }
      if (first === null || second === null) {
        return false;
      }
      if (first instanceof Error || second instanceof Error) {
        throw first || second;
      }
      return first.equals(second);
    }

    public isSameDay(date: LocalDateTime, comparing: LocalDateTime): boolean {
      if (date === null && comparing === null) {
        return true;
      }
      if (date === null || comparing === null) {
        return false;
      }
      return (
        date.dayOfMonth() === comparing.dayOfMonth() &&
        date.monthValue() === comparing.monthValue() &&
        date.year() === comparing.year()
      );
    }

    public isSameMonth(date: LocalDateTime, comparing: LocalDateTime): boolean {
      return (
        date.monthValue() === comparing.monthValue() && date.year() === comparing.year()
      );
    }

    public isSameYear(date: LocalDateTime, comparing: LocalDateTime): boolean {
      return date.year() === comparing.year();
    }

    public isSameHour(date: LocalDateTime, comparing: LocalDateTime): boolean {
      return (
        date.hour() === comparing.hour() &&
        date.dayOfMonth() === comparing.dayOfMonth() &&
        date.monthValue() === comparing.monthValue() &&
        date.year() === comparing.year()
      );
    }

    public isAfter(date: LocalDateTime, value: LocalDateTime): boolean {
      return date.isAfter(value);
    }

    public isAfterDay(
      date: LocalDateTime | LocalDate,
      value: LocalDateTime | LocalDate
    ): boolean {
      if (date instanceof LocalDate) {
        date = LocalDateTime.of(date, LocalTime.of(0, 0, 0));
      }
      if (value instanceof LocalDate) {
        value = LocalDateTime.of(value, LocalTime.of(0, 0, 0));
      }

      return date.isAfter(
        value
          .plusDays(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .minusNanos(1)
      );
    }

    public isAfterYear(date: LocalDateTime, value: LocalDateTime): boolean {
      return date.isAfter(
        value
          .plusYears(1)
          .withDayOfYear(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .minusNanos(1)
      );
    }

    public isBeforeDay(
      date: LocalDateTime | LocalDate,
      value: LocalDateTime | LocalDate
    ): boolean {
      if (date instanceof LocalDate) {
        date = LocalDateTime.of(date, LocalTime.of(0, 0, 0));
      }
      if (value instanceof LocalDate) {
        value = LocalDateTime.of(value, LocalTime.of(0, 0, 0));
      }

      return date.isBefore(
        value
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0)
      );
    }

    public isBeforeYear(date: LocalDateTime, value: LocalDateTime): boolean {
      return date.isBefore(
        value
          .withDayOfYear(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0)
      );
    }

    public startOfMonth(date: LocalDateTime): LocalDateTime;
    public startOfMonth(date: LocalDate): LocalDate;
    public startOfMonth(date) {
      if (date instanceof LocalDateTime) {
        return date
          .withDayOfMonth(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0);
      }
      return date.withDayOfMonth(1);
    }

    public endOfMonth(date: LocalDateTime): LocalDateTime;
    public endOfMonth(date: LocalDate): LocalDate;
    public endOfMonth(date) {
      if (date instanceof LocalDateTime) {
        return date
          .plusMonths(1)
          .withDayOfMonth(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .minusNanos(1);
      }
      return date
        .plusMonths(1)
        .withDayOfMonth(1)
        .minusDays(1);
    }

    public addDays(date: LocalDateTime, count: number): LocalDateTime {
      return date.plusDays(count);
    }

    public startOfDay(date: DateType<LocalDateTime>): LocalDateTime;
    public startOfDay(date: DateType<LocalDate>): LocalDate;
    public startOfDay(date) {
      if (date instanceof LocalDateTime) {
        return date
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0);
      }

      return date;
    }

    public endOfDay(date: DateType<LocalDateTime>): LocalDateTime;
    public endOfDay(date: DateType<LocalDate>): LocalDate;
    public endOfDay(date) {
      if (date instanceof LocalDateTime) {
        return date
          .plusDays(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .minusNanos(1);
      }
      return date;
    }

    // v2.0.0
    // public format(date: DateType<Temporal>, formatKey: keyof DateIOFormats): string {
    //   let formatter = DateTimeFormatter.ofPattern(formatKey).withLocale(this.locale);
    //   return date.format(formatter);
    // }

    // @Deprecated
    public format(date: Temporal, formatString: string): string {
      let formatter = DateTimeFormatter.ofPattern(formatString).withLocale(this.locale);
      return date.format(formatter);
    }

    public formatByString(date: Temporal, formatString: string): string {
      let formatter = DateTimeFormatter.ofPattern(formatString).withLocale(this.locale);
      return date.format(formatter);
    }

    public formatNumber(numberToFormat: string): string {
      return numberToFormat;
    }

    public getHours(date: LocalDateTime): number {
      return date.hour();
    }

    public setHours(date: LocalDateTime, count: number): LocalDateTime {
      return date.withHour(count);
    }

    public getMinutes(date: LocalDateTime): number {
      return date.minute();
    }

    public setMinutes(date: LocalDateTime, count: number): LocalDateTime {
      return date.withMinute(count);
    }

    public getSeconds(date: LocalDateTime): number {
      return date.second();
    }

    public setSeconds(date: LocalDateTime, count: number): LocalDateTime {
      return date.withSecond(count);
    }

    public getMonth(date: LocalDateTime): number {
      return date.monthValue() - 1;
    }

    public setMonth(date: LocalDateTime, count: number): LocalDateTime {
      return date.withMonth(count + 1);
    }

    public getPreviousMonth(date: LocalDateTime): LocalDateTime {
      return date.minusMonths(1);
    }

    public getNextMonth(date: LocalDateTime): LocalDateTime {
      return date.plusMonths(1);
    }

    public getMonthArray(date: LocalDateTime): LocalDateTime[] {
      const months: Array<LocalDateTime> = [];
      for (let i = 1; i <= 12; i++) {
        const localDateTime = date
          .withMonth(i)
          .withDayOfMonth(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0);
        months.push(localDateTime);
      }
      return months;
    }

    public getYear(date: LocalDateTime): number {
      return date.year();
    }

    public setYear(date: LocalDateTime, year: number): LocalDateTime {
      return date.withYear(year);
    }

    public mergeDateAndTime(
      date: LocalDateTime | LocalDate,
      time: LocalDateTime | LocalDate
    ): LocalDateTime | LocalDate {
      if (date instanceof LocalDate || time instanceof LocalDate) {
        return date;
      }
      return date
        .withHour(time.hour())
        .withMinute(time.minute())
        .withSecond(time.second())
        .withNano(time.nano());
    }

    public getWeekdays(): string[] {
      const today = LocalDateTime.now();
      const startOfWeek = this.startOfWeek(today);

      const weekdays = [];
      const formatter = DateTimeFormatter.ofPattern("eee").withLocale(this.locale);
      for (let i = 0; i < 7; i++) {
        weekdays.push(startOfWeek.plusDays(i).format(formatter));
      }
      return weekdays;
    }

    public getWeekArray(date: LocalDateTime): LocalDateTime[][];
    public getWeekArray(date: LocalDate): LocalDate[][];
    public getWeekArray(date) {
      if (!this.locale) {
        throw new Error("Function getWeekArray() requires a locale to be set.");
      }

      let startOfMonth = this.startOfMonth(date);
      let endOfMonth = this.endOfMonth(date);

      const start = this.startOfWeek(startOfMonth);
      const end = this.endOfWeek(endOfMonth);

      let count = 0;
      let current = start;
      const nestedWeeks: CalendarType[][] = [];

      while (current.isBefore(end)) {
        const weekNumber = Math.floor(count / 7);
        nestedWeeks[weekNumber] = nestedWeeks[weekNumber] || [];
        nestedWeeks[weekNumber].push(current);
        current = current.plusDays(1);
        count += 1;
      }
      return nestedWeeks;
    }

    public getYearRange(
      start: DateType<LocalDateTime>,
      end: DateType<LocalDateTime>
    ): LocalDateTime[];
    public getYearRange(
      start: DateType<LocalDate>,
      end: DateType<LocalDate>
    ): LocalDate[];
    public getYearRange(start, end) {
      if (start instanceof Error || end instanceof Error) {
        throw new Error("getYearRange(): Invalid type for parameter start and/or end.");
      }
      const years: CalendarType[] = [];

      let startDate: CalendarType;
      let endDate: CalendarType;
      if (start instanceof LocalDateTime) {
        startDate = start
          .withDayOfYear(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0);

        endDate = end
          .plusYears(1)
          .withDayOfYear(1)
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0);
      } else if (start instanceof LocalDate) {
        startDate = start.withDayOfYear(1);
        endDate = end.plusYears(1).withDayOfYear(1);
      }

      while (this.isBefore(startDate, endDate)) {
        years.push(startDate);
        startDate = startDate.plusYears(1);
      }
      return years;
    }

    public isBefore(date: CalendarType, value: CalendarType): boolean {
      if (date instanceof LocalDateTime) {
        assumeType<LocalDateTime>(value);
        return date.isBefore(value);
      } else if (date instanceof LocalDate) {
        assumeType<LocalDate>(value);
        return date.isBefore(value);
      }
    }

    private startDayOfWeek(): number {
      let startDayOfWeek;
      switch (this.locale.localeString()) {
        case "en-US":
          startDayOfWeek = 7; // Sunday (day 7 in js-joda, which implements ISO8601 calendar only)
          break;
        default:
          startDayOfWeek = 1; // Monday
      }
      return startDayOfWeek % 7;
    }

    public getMeridiemText(ampm: "am" | "pm"): string {
      return ampm === "am" ? "AM" : "PM";
    }

    private startOfWeek(value: LocalDateTime): LocalDateTime;
    private startOfWeek(value: LocalDate): LocalDate;
    private startOfWeek(value) {
      const dayOfWeek = value.dayOfWeek().value();
      if (value instanceof LocalDateTime) {
        return value
          .minusDays(dayOfWeek - this.startDayOfWeek())
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0);
      }
      return value.minusDays(dayOfWeek - this.startDayOfWeek());
    }

    private endOfWeek(value: LocalDateTime): LocalDateTime;
    private endOfWeek(value: LocalDate): LocalDate;
    private endOfWeek(value) {
      const dayOfWeek = value.dayOfWeek().value();
      if (value instanceof LocalDateTime) {
        return value
          .plusDays(7 - (dayOfWeek - this.startDayOfWeek()))
          .withHour(0)
          .withMinute(0)
          .withSecond(0)
          .withNano(0)
          .minusNanos(1);
      }
      return value.plusDays(7 - (dayOfWeek - this.startDayOfWeek()));
    }
  };
}
