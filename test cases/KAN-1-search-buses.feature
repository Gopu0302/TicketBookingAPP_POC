Feature: Search buses between two cities
  As a traveler
  I want to search for buses between a source and destination city on a chosen date
  So that I can see available bus options for my trip

  Scenario: Searching a valid route and date navigates to results with buses listed
    Given I am on the redBus homepage
    When I enter a valid "From" city, a valid "To" city, select a travel date, and click Search
    Then I am taken to the search results page showing buses for that route and date

  Scenario: Results page displays the selected source city, destination city, and date
    Given I have searched for buses between a valid source and destination city on a chosen date
    When the search results page loads
    Then the page displays the selected source city, destination city, and date

  Scenario: Each available bus result shows operator, times, duration, and fare
    Given I am on the search results page for a route/date with available buses
    When the results are displayed
    Then each result shows the operator name, departure time, arrival time, duration, and fare

  Scenario: A route/date with no buses shows a "no buses found" message instead of an error
    Given I search for buses on a route/date with no available buses
    When the search results page loads
    Then a "no buses found" message is shown instead of an error

  Scenario: Searching with the same city for "From" and "To" shows a validation message
    Given I am on the redBus homepage
    When I select the same city for both "From" and "To" and attempt to search
    Then a validation message is shown instead of search results

  Scenario: Attempting to search without selecting a "From" city is prevented
    Given I am on the redBus homepage with only the "To" city and date filled in
    When I click Search without selecting a "From" city
    Then the search is not performed and a validation message prompts me to select a "From" city

  Scenario: Attempting to search without selecting a "To" city is prevented
    Given I am on the redBus homepage with only the "From" city and date filled in
    When I click Search without selecting a "To" city
    Then the search is not performed and a validation message prompts me to select a "To" city
