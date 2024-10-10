module default {
  type Beneficiary {
    required property name -> str;
    required property cpf -> str;
  }

  type Schedule {
    required property id -> str;
    required property date -> str;
    required property time -> str;
  }
}