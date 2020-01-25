import {
  Period,
  Duration,
  ZoneId,
  IsoFields,
  LocalDateTime,
  ZonedDateTime,
  DateTimeParseException,
  DateTimeFormatter,
  Instant,
  ZoneOffset
} from "@js-joda/core";
import { IUtils /*, DateIOFormats */ } from "@date-io/core/IUtils";
import { DateType as Temporal } from "@date-io/type";

//import { WeekFields } from '@js-joda/locale/dist/js-joda-locale';

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

// type Temporal = LocalDateTime | Error;

export default class JsJodaUtils implements IUtils<Temporal> {
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
  public getCalendarHeaderText(date: Temporal) {
    if (date instanceof Error) {
      throw date;
    }
    let formatter = DateTimeFormatter.ofPattern(this.yearMonthFormat).withLocale(
      this.locale
    );
    return date.format(formatter);
  }

  public getYearText(date: Temporal) {
    if (date instanceof Error) {
      throw date;
    }
    let formatter = DateTimeFormatter.ofPattern(this.yearFormat).withLocale(this.locale);
    return date.format(formatter);
  }

  public getDatePickerHeaderText(date: Temporal) {
    if (date instanceof Error) {
      throw date;
    }
    let formatter = DateTimeFormatter.ofPattern("EEE, MMM d").withLocale(this.locale);
    return date.format(formatter);
  }

  public getDateTimePickerHeaderText(date: Temporal) {
    if (date instanceof Error) {
      throw date;
    }
    return this.format(date, "MMM d");
  }

  public getMonthText(date: Temporal) {
    if (date instanceof Error) {
      throw date;
    }
    return this.format(date, "MMMM");
  }

  public getDayText(date: Temporal) {
    if (date instanceof Error) {
      throw date;
    }
    return this.format(date, "d");
  }

  public getHourText(date: Temporal, ampm: boolean) {
    if (date instanceof Error) {
      throw date;
    }
    return this.format(date, ampm ? "hh" : "HH");
  }

  public getMinuteText(date: Temporal) {
    if (date instanceof Error) {
      throw date;
    }
    return this.format(date, "mm");
  }

  public getSecondText(date: Temporal) {
    if (date instanceof Error) {
      throw date;
    }
    return this.format(date, "ss");
  }
  // EOF @Deprecated

  public parse(value: string, format: string): Temporal | null {
    if (value === "") {
      return null;
    }

    let formatter = DateTimeFormatter.ofPattern(format).withLocale(this.locale);

    try {
      return LocalDateTime.parse(value, formatter);
    } catch (ex) {
      if (ex instanceof DateTimeParseException) {
        return ex;
      }
      throw ex;
    }
  }

  public date(value?: any): Temporal | null {
    if (value === null) {
      return null;
    }

    if (typeof value === "undefined") {
      return LocalDateTime.now();
    }

    if (typeof value === "string") {
      const date = new Date(value);
      if (isNaN(date.valueOf())) {
        return null;
      }
      const instant = Instant.ofEpochMilli(date.valueOf());
      const localDateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
      return localDateTime;
    }

    if (value instanceof LocalDateTime) {
      return value;
    }

    if (value instanceof Error) {
      return value;
    }

    if (value instanceof Date) {
      const instant = Instant.ofEpochMilli(value.valueOf());
      return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }

    throw new Error(`Unknown Date value in function date(): ${value}`);
  }

  public isNull(date: Temporal | null): boolean {
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

    if (value instanceof LocalDateTime) {
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

  public isAfterDay(date: LocalDateTime, value: LocalDateTime): boolean {
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

  public isBefore(date: LocalDateTime, value: LocalDateTime): boolean {
    return date.isBefore(value);
  }

  public isBeforeDay(date: LocalDateTime, value: LocalDateTime): boolean {
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

  public startOfMonth(date: LocalDateTime): LocalDateTime {
    return date
      .withDayOfMonth(1)
      .withHour(0)
      .withMinute(0)
      .withSecond(0)
      .withNano(0);
  }

  public endOfMonth(date: LocalDateTime): LocalDateTime {
    return date
      .plusMonths(1)
      .withDayOfMonth(1)
      .withHour(0)
      .withMinute(0)
      .withSecond(0)
      .minusNanos(1);
  }

  public addDays(date: LocalDateTime, count: number): LocalDateTime {
    return date.plusDays(count);
  }

  public startOfDay(date: LocalDateTime): LocalDateTime {
    return date
      .withHour(0)
      .withMinute(0)
      .withSecond(0)
      .withNano(0);
  }

  public endOfDay(date: LocalDateTime): LocalDateTime {
    return date
      .plusDays(1)
      .withHour(0)
      .withMinute(0)
      .withSecond(0)
      .minusNanos(1);
  }

  // v2.0.0
  // public format(date: Temporal, formatKey: keyof DateIOFormats): string {
  //   let formatter = DateTimeFormatter.ofPattern(formatKey).withLocale(this.locale);
  //   return date.format(formatter);
  // }

  // @Deprecated
  public format(date: LocalDateTime, formatString: string): string {
    let formatter = DateTimeFormatter.ofPattern(formatString).withLocale(this.locale);
    return date.format(formatter);
  }

  public formatByString(date: LocalDateTime, formatString: string): string {
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

  public mergeDateAndTime(date: LocalDateTime, time: LocalDateTime): LocalDateTime {
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

  public getWeekArray(date: LocalDateTime): LocalDateTime[][] {
    if (!this.locale) {
      throw new Error("Function getWeekArray() requires a locale to be set.");
    }

    const start = this.startOfWeek(this.startOfMonth(date));
    const end = this.endOfWeek(this.endOfMonth(date));

    // const weekOfWeekBasedYear = date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
    // const weekBasedYear = date.get(IsoFields.WEEK_BASED_YEAR)

    let count = 0;
    let current = start;
    const nestedWeeks: LocalDateTime[][] = [];

    while (current.isBefore(end)) {
      const weekNumber = Math.floor(count / 7);
      nestedWeeks[weekNumber] = nestedWeeks[weekNumber] || [];
      nestedWeeks[weekNumber].push(current);
      current = current.plusDays(1);
      count += 1;
    }
    return nestedWeeks;
  }

  public getYearRange(start: LocalDateTime, end: LocalDateTime): LocalDateTime[] {
    const startDate = start
      .withDayOfYear(1)
      .withHour(0)
      .withMinute(0)
      .withSecond(0)
      .withNano(0);

    const endDate = end
      .plusYears(1)
      .withDayOfYear(1)
      .withHour(0)
      .withMinute(0)
      .withSecond(0)
      .withNano(0);

    const years: LocalDateTime[] = [];

    let current = startDate;
    while (current.isBefore(endDate)) {
      years.push(current);
      current = current.plusYears(1);
    }
    return years;
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

  private startOfWeek(value: LocalDateTime): LocalDateTime {
    const dayOfWeek = value.dayOfWeek().value();
    return value
      .minusDays(dayOfWeek - this.startDayOfWeek())
      .withHour(0)
      .withMinute(0)
      .withSecond(0)
      .withNano(0);
  }

  private endOfWeek(value: LocalDateTime): LocalDateTime {
    const dayOfWeek = value.dayOfWeek().value();
    return value
      .plusDays(7 - (dayOfWeek - this.startDayOfWeek()))
      .withHour(0)
      .withMinute(0)
      .withSecond(0)
      .withNano(0)
      .minusNanos(1);
  }
}
