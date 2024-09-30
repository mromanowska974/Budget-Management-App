import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { ContainerDirective } from '../directives/container.directive';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [
    NavbarComponent,
    ContainerDirective,

    CommonModule
  ],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.css'
})
export class AboutPageComponent {
  functionalities = [
    {
      imgSrc: '../../assets/screenshots/monthly-expenses.png',
      title: 'Śledzenie wydatków',
      description: 'Aplikacja umożliwia 3 sposoby przekazania informacji na temat Twoich miesięcznych wydatków: poprzez opis słowny, wykresy całego miesiąca i z podziałem na kategorie oraz szczegółowe zestawienie wszystkich miesięcznych wydatków w tabeli. Możesz również wracać do wydatków z poprzednich miesięcy.'
    },
    {
      imgSrc: '../../assets/screenshots/add-expense.png',
      title: 'Dodawanie wydatków',
      description: 'Za pomocą przycisku "Dodaj wydatek" w panelu głównym możesz wprowadzić nowy wydatek do systemu. Aplikacja przekieruje Cię do formularza, który poprosi Cię o takie dane jak kwota, opis, kategoria, data czy cykliczność.'
    },
    {
      imgSrc: '../../assets/screenshots/double-click-edit.png',
      title: 'Edycja wydatków',
      description: 'W sekcji "Ostatnie wydatki" możesz zmienić dowolną informację na temat wprowadzonego wydatku za pomocą podwójnego przycisku myszy na wybranej informacji. Zmiany możesz zapisać przyciskiem Enter.'
    },
    {
      imgSrc: '../../assets/screenshots/categories-menu.png',
      title: 'Kategorie',
      description: 'Aplikacja umożliwia zarządzanie dowolnymi kategoriami wydatków. Możesz dodać tyle kategorii ile tylko potrzebujesz. Każdej z nich nadaj unikalny kolor, który wyróżni każdą kategorię na wykresach.'
    },
    {
      imgSrc: '../../assets/screenshots/categories-view.png',
      title: 'Widok kategorii',
      description: 'Oprócz ogólnych wydatków miesięcznych możesz również przeglądać swoje wydatki według wybranej w menu rozwijanym kategorii. Możesz także edytować nazwę i kolor kategorii lub ją usunąć, gdy jest pusta (np. gdy przeniesiesz wydatki do innych kategorii).'
    },
    {
      imgSrc: '../../assets/screenshots/profiles.png',
      title: 'Założyciel i Współdzielący',
      description: ' Zakładając konto w aplikacji Smart Coinbook automatycznie stajesz się jego Założycielem, co oznacza pewne dodatkowe możliwości. Możesz dodawać nowe profile dla osób, z którymi będziesz konto współdzielić. Będą oni mieć status Współdzielący oraz będą mieć dostęp do podstawowych funkcjonalności.'
    },
    {
      imgSrc: '../../assets/screenshots/admin-rights.png',
      title: 'Prawa Założyciela',
      description: 'Jako Założyciel konta możesz dodawać profile Współdzielących, edytować je lub usuwać, a także przeglądać wydatki Współdzielących w trybie podglądu. Jest to funkcja szczególnie przydatna dla rodziców chcących mieć pewność, że ich pociechy odpowiedzialnie dysponują swoimi środkami. Ponadto jedynie Założyciele mają możliwość promocji konta do Statusu Plus. Profile Współdzielących automatycznie otrzymują dodatkowe korzyści.'
    },
    {
      imgSrc: '../../assets/screenshots/preview-mode.png',
      title: 'Tryb podglądu',
      description: 'Jeśli jesteś rodzicem i współdzielisz konto ze swoimi dziećmi, chcesz mieć pewność, że wydają one swoje kieszonkowe odpowiedzialnie. Tryb podglądu umożliwi Ci przeglądanie ich wydatków. Nie możesz jednak wprowadzać żadnych zmian w tym trybie.'
    },
    {
      imgSrc: '../../assets/screenshots/status-plus.png',
      title: 'Status Plus',
      description: ' Po zakupie subskrypcji Status Plus masz możliwość utworzyć aż 6 profili zamiast 3 w wersji podstawowej. Ponadto możesz nadać 2 dodatkowym profilom uprawnienia Założyciela. Subskrypcja jest szczególnie przydatna dla osób, które chcą współdzielić konto z wieloma osobami, np. całą rodziną.'
    }
  ]
}
