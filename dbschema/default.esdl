module default {
  type Beneficiary {
    required property name -> str;
    required property cpf -> str;
  }

  type Schedule {
    required property date -> str;
    required property time -> str;
    required link beneficiary -> Beneficiary;
  }
}