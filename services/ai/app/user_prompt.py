# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    user_prompt.py                                     :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: aelison <aelison@student.42antananarivo.m  +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/01/19 10:40:52 by aelison           #+#    #+#              #
#    Updated: 2026/01/19 11:00:02 by aelison          ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

class user_prompt:

    def __init__(self, size: int):
        self._size = size
        self._index = 0
        self._values = [''] * size
        self._nb_elem = 0

    def add(self, value: str):
        self._values[self._index] = value

        self._index = (self._index + 1) % self._size

        if self._nb_elem < self._size:
            self._nb_elem += 1

    def get_current(self):
        return self._values[(self._index - 1) % self._size]

    def get_history(self):
        result = []

        for i in range(self._nb_elem):
            elem = (self._index - self._nb_elem + i) & self._size
            result.append(self._values[elem])
        return result

prompt = user_prompt(10)
