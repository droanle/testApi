module default {
  type Beneficiary {
    required property name -> str;
    required property cpf -> str;
  }

  type Schedule {
    required property date -> cal::local_date;
    required property time -> cal::local_time;
    required link beneficiary -> Beneficiary;
  }
}